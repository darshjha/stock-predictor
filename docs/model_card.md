# Stock-Predictor Model Card

**Model**: RandomForestRegressor predicting next-day close price.  
**Input features**: Close, 20-day rolling mean, 20-day rolling std.  
**Target**: Next-day close price of the given ticker.

## Intended Use
Quick experimentation and educational purposes for time-series price prediction.

## Metrics
Mean Squared Error (MSE) on the latest 20 % hold-out split.  
_See `src/train.py` for details._

## Limitations & Risks
* Does not account for market events, macroeconomic factors, or intraday data.  
* Only regression on price; no probability estimates.  
* **Not financial advice.**

## Future Work
* Hyper-parameter search & cross-validation  
* Incorporate technical indicators (TA-Lib)  
* Extend horizon predictions using seq2seq models