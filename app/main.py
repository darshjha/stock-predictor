"""
FastAPI service exposing /predict and /health.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
MODELS_DIR = PROJECT_ROOT / "models"

# Ensure `src` is importable when running `uvicorn app.main:app`
sys.path.append(str(SRC_DIR))

from src.features import add_rolling_features  # type: ignore
from src.utils import load_model  # type: ignore

MODEL_PATH = MODELS_DIR / "model.joblib"

app = FastAPI(title="Stock Predictor API", version="0.1.0")

# ---- Load model once at startup ----
try:
    model: Any = load_model(MODEL_PATH)
except FileNotFoundError:
    # TODO: proper structured logging
    print(f"[WARN] Model not found at {MODEL_PATH}. /predict will be unavailable.")
    model = None


class PredictionResponse(BaseModel):
    ticker: str
    horizon: int
    predicted_price: float


@app.get("/predict", response_model=PredictionResponse)
def predict(
    ticker: str = Query(..., description="Ticker symbol (e.g. TSLA)"),
    horizon: int = Query(5, ge=1, le=30, description="Days ahead to predict"),
):
    """
    Predict `horizon`-day ahead price.
    Currently returns 1-day prediction and echoes horizon (TODO).
    """

    if model is None:
        raise HTTPException(status_code=503, detail="Model unavailable.")

    try:
        df = yf.download(ticker, period="1y", interval="1d").dropna()
        df = add_rolling_features(df).dropna()
        latest = df.iloc[-1][["Close", "rolling_mean_20", "rolling_std_20"]].values.reshape(1, -1)
        predicted_price = float(model.predict(latest)[0])
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return PredictionResponse(ticker=ticker, horizon=horizon, predicted_price=predicted_price)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}