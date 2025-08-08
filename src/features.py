"""
Feature-engineering helpers.
"""

from __future__ import annotations

import pandas as pd


def add_rolling_features(df: pd.DataFrame, window: int = 20) -> pd.DataFrame:
    """
    Append rolling mean & std features on the Close column.
    """

    df = df.copy()
    df[f"rolling_mean_{window}"] = df["Close"].rolling(window=window).mean()
    df[f"rolling_std_{window}"] = df["Close"].rolling(window=window).std()

    # TODO: add TA-Lib indicators, lag features, etc.
    return df