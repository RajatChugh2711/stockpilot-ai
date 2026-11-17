# Phase 1 — Market Data Plan

## Objective

Given a company name, identify its listed NSE/BSE instruments and return a source-traceable daily price history for the selected period plus the latest permitted quote or exchange close.

## Release 1 scope

- Company and instrument search (name, NSE symbol, BSE scrip code and ISIN).
- NSE/BSE exchange instrument master with issuer-to-instrument mapping.
- Daily historical OHLCV, starting with a one-year chart window.
- Latest permitted quote or latest official close, with source and as-of timestamp.
- Price-basis labels: raw exchange price, split/bonus-adjusted price and total-return series only when corporate-action inputs are complete.
- Data provenance, freshness, missing-session detection and audit-friendly ingestion jobs.

Out of scope for this phase: live streaming, intraday candles, fundamentals/financial statements, AI research, forecasting, IPO analysis, portfolios and buy/sell recommendations.

## Provider gate

Read [Data Provider Strategy](DATA_PROVIDER_STRATEGY.md) before implementing any live adapter.

No provider should be selected solely because an individual API key works or the public subscription price is low. Commercial web/mobile display, subscriber access, historical caching, derived analytics and report generation must all be explicitly permitted.

Shortlist:
- Direct NSE and BSE agreements as the authoritative baseline.
- TrueData as the first unified-vendor quote request, subject to separate API approval and written SaaS rights.
- DhanHQ partner programme as a secondary integration path, not an individual account token.

## Implementation sequence

### 1. Provider contract and instrument master
- Obtain written commercial permissions and pricing.
- Import the permitted exchange/security master files.
- Normalize company identity separately from each exchange listing.
- Store provider instrument identifiers as mappings.

### 2. Provider-neutral API contract
- Define interfaces for instrument search, daily history, latest quote and corporate actions.
- Normalize timestamps to UTC for storage and retain exchange trading date in Asia/Kolkata.
- Keep vendor-specific payloads inside adapters.

### 3. Historical ingestion
- Backfill daily OHLCV for the agreed instrument universe and period.
- Use idempotent upserts and bounded rate limits.
- Persist source provider, source-as-of, ingestion time and price basis.
- Quarantine invalid bars rather than silently repairing them.

### 4. Read API and UI
- Add company/instrument search endpoints.
- Add daily history and latest-quote endpoints with pagination/window limits.
- Show data provider, delay/freshness and as-of timestamp in the dashboard.
- Render missing data explicitly; never fill gaps with fabricated values.

### 5. Verification
- Validate the adapter against the provider's sample files/responses.
- Reconcile selected instruments against exchange/provider reference outputs.
- Test holidays, suspensions, symbol changes, duplicate bars and missing sessions.
- Verify corporate-action adjustment logic on split/bonus/dividend examples.

## Definition of done

A user can search a listed company, select the correct NSE/BSE listing, see a one-year daily chart and a latest quote/close, and inspect the source provider and timestamp. The same result can be reproduced from stored, licensed data with ingestion logs.

No forecast or profitability promise is part of this phase. Forecast evaluation belongs to a later phase after reliable history and corporate actions are established.
