# Analytics methodology

## Principles

- Deterministic calculations for financial numbers.
- AI explains structured results; it does not invent missing facts.
- Missing or stale data is visible.
- Scores are explainable and versioned.
- Forecasts are uncertain distributions, never guaranteed returns.

## Historical data

Retain raw OHLCV. Build separate split/bonus-adjusted and dividend-adjusted total-return series. Record adjustment factors and methodology.

## Candidate metrics

Returns, rolling volatility, drawdown, benchmark-relative performance, SMA/EMA, RSI, MACD, Bollinger Bands and ATR. Store indicator parameters and calculation version.

## Research scoring

Proposed dimensions: fundamentals, valuation, technical condition, growth and sentiment. Report risk separately. Weights and thresholds remain hypotheses until tested. Missing coverage must be disclosed.

## Forecasting lifecycle

1. Validate data and corporate actions.
2. Build features using only data available at the prediction cutoff.
3. Establish naive and statistical baselines.
4. Compare candidate models using chronological splits.
5. Run walk-forward evaluation.
6. Calibrate prediction intervals.
7. Persist immutable forecast snapshots and model versions.
8. Evaluate at target date against actual outcomes.
9. Monitor drift and disable degraded models.

## Evaluation

Use MAE/RMSE, directional accuracy, Brier score for event probabilities, interval coverage/width and calibration. Report horizon, sample size, evaluation period and baseline. No accuracy claim without reproducible out-of-sample evidence.
