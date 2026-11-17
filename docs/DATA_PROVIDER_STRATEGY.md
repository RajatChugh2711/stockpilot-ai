# Data provider strategy

## Non-negotiable rule

Do not scrape exchange websites or redistribute third-party data unless the applicable agreement expressly allows the intended activity. API access does not automatically grant SaaS display, storage, derived-work or redistribution rights.

## Providers to evaluate

- NSE Data & Analytics: NSE reference, historical and EOD products.
- BSE Information Products: BSE EOD, historical, delayed and corporate information.
- Approved vendors such as TrueData: market-data coverage and delivery reliability.
- Upstox API: evaluate company fundamentals and market data only after confirming commercial SaaS rights.

## Due diligence checklist

Obtain written answers for historical/EOD coverage, delay interval, NSE/BSE coverage, corporate actions, adjusted history, financial statements, rate limits, uptime, storage/caching rights, end-user display, subscriber counts, derived analytics, report generation, redistribution, attribution, retention and pricing.

## Adapter design

Provider-specific schemas must not leak into the core domain. Adapters normalize instruments, history, quotes, corporate actions and fundamentals.

## Ingestion controls

Idempotent upserts, request budgets, bounded retries, mapping validation, OHLC and volume checks, quarantine, manual reconciliation, provenance and freshness metadata. Raw payload retention is allowed only where contractually permitted.

## Launch gate

Do not enable paid customer-facing data features until licensing and redistribution terms are approved for the exact use case.
