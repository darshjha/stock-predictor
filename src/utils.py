"""
Generic utilities (model persistence, paths, etc.).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib


def save_model(model: Any, path: Path) -> None:
    """
    Persist a model to disk.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)


def load_model(path: Path) -> Any:
    """
    Load a model from disk.
    """
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)