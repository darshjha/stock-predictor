import pandas as pd

from src.features import add_rolling_features


def test_add_rolling_features():
    # create minimal dataframe
    df = pd.DataFrame({"Close": range(30)})
    out = add_rolling_features(df, window=5)
    assert "rolling_mean_5" in out.columns
    assert "rolling_std_5" in out.columns
    # first rolling_mean should be NaN until 5 rows
    assert pd.isna(out["rolling_mean_5"].iloc[3])
    assert not pd.isna(out["rolling_mean_5"].iloc[4])