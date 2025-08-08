#!/usr/bin/env python3
"""
Pipeline:
1. Download SPY OHLCV data via yfinance.
2. Engineer 20-day rolling mean/std features.
3. Train RandomForestRegressor to predict next-day Close.
4. Save model to models/model.joblib
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

from .features import add_rolling_features
from .utils import save_model

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_PATH = MODEL_DIR / "model.joblib"


def fetch_data(symbol: str = "SPY", period: str = "5y") -> pd.DataFrame:
    # TODO: cache locally to avoid repeat downloads
    return yf.download(symbol, period=period, interval="1d").dropna()


def prepare_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    df = add_rolling_features(df)
    df["target"] = df["Close"].shift(-1)  # predict next-day Close
    df = df.dropna()
    X = df[["Close", "rolling_mean_20", "rolling_std_20"]]
    y = df["target"]
    return X, y


def train_model(X: pd.DataFrame, y: pd.Series) -> RandomForestRegressor:
    # TODO: hyperparameter tuning / CV
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True, parents=True)
    MODEL_DIR.mkdir(exist_ok=True, parents=True)

    df = fetch_data()
    X, y = prepare_dataset(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model = train_model(X_train, y_train)
    mse = mean_squared_error(y_test, model.predict(X_test))
    print(f"Test MSE: {mse:.6f}")

    save_model(model, MODEL_PATH)
    print(f"Model saved → {MODEL_PATH}")


if __name__ == "__main__":
    main()