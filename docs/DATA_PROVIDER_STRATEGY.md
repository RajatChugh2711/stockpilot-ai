# Data Provider Strategy

**Research checked: 17 November 2026.** Confirm current tariffs and contractual terms directly with each provider before purchase.

## Non-negotiable rule

Do not scrape exchange websites or redistribute third-party data unless the applicable agreement expressly allows the intended activity. API access does not automatically grant SaaS display, storage, derived-work or redistribution rights.

The contract must explicitly cover website/mobile-app display, paid end users, caching and historical storage, derived analytics, reports, subscriber/user limits, attribution, retention and any redistribution.

## Provider assessment

| Provider | Technical fit for StockPilot | Commercial-use position | Assessment |
|---|---|---|---|
| NSE Data & Analytics | Official NSE real-time, snapshot, EOD, historical and corporate-data products | Commercial usage is governed by a direct subscription agreement; the permitted method of display/distribution must be in that agreement | Primary route for NSE coverage |
| BSE Information Products | Official BSE equity/index, EOD/reference, historical and corporate products | Direct portal requires registration/KYC, plan selection, pricing and agreements; confirm the precise web-app/SaaS rights in writing | Primary route for BSE coverage |
| TrueData Market Data API | Supports NSE/BSE; published help page says daily bars are available for 10+ years | API access is a separate application and compliance approval; Velocity/terminal subscriptions do not include programmatic API access | Strong vendor candidate, subject to API and SaaS licence approval |
| DhanHQ Data API | Daily OHLCV back to instrument inception; intraday data also documented | ₹499 + applicable taxes/month is the individual Data API subscription. Dhan separately defines partner platforms (including fintechs) and asks partners to onboard through its partner route. Do not treat an individual subscription as a SaaS redistribution licence | Useful for private development; partner approval required for SaaS |
| Upstox Developer API | Historical Candle V3 documents daily history from January 2000 and recent intraday history | Developer API documentation proves technical access, not the right to redistribute market data to StockPilot subscribers; obtain written commercial permission | Technical candidate; licence must be confirmed |
| Global Datafeeds API | NSE/BSE historical and real-time feeds are documented | Published API eligibility page says API access is for individual personal use; commercial use requires an agreement with the exchanges and applicable fees | Not suitable for paid SaaS without a separate commercial agreement |

### Primary sources

- [NSE Data & Analytics products and tariffs](https://www.nseindia.com/static/nse-data-and-analytics/data-information-vending)
- [NSE Data Sharing & Usage Policy](https://nseindia.in/static/market-data/nse-data-policy)
- [BSE Self Data Feed portal](https://marketdata.bseindia.com/)
- [BSE Information Products tariff sheet (February 2025; obtain a current quote)](https://www.bseindia.com/downloads1/Information_Products_Pricing_Sheet.pdf)
- [TrueData pricing and API application guidance](https://www.truedata.in/information/pricing)
- [TrueData historical-data availability](https://feedback.truedata.in/knowledge-base/article/historical-real-time-data-availability-through-market-data-api)
- [DhanHQ authentication and partner onboarding](https://dhanhq.co/docs/v2/authentication/)
- [DhanHQ historical data API](https://dhanhq.co/docs/v2/historical-data/)
- [Upstox Historical Candle API V3](https://upstox.com/developer/api-documentation/v3/get-historical-candle-data/)
- [Global Datafeeds API buyer eligibility](https://globaldatafeeds.in/global-datafeeds-apis/global-datafeeds-apis/pricing-sales/who-can-purchase/)

## Recommended commercial path

For the production SaaS, request proposals from:

1. NSE Data & Analytics directly for NSE EOD/history and the required snapshot/delayed quote entitlement.
2. BSE Information Products directly for BSE EOD/history, reference data and company/corporate information.
3. TrueData as a possible single-vendor alternative for both exchanges, but only after its API team confirms SaaS display, historical storage and derived-analytics rights in writing.

Compare the total permitted-use cost, not just the API subscription fee. Ask for fees at launch scale and at 1,000 / 5,000 / 10,000 registered users. Clarify whether the fee changes with active users, concurrent users, symbols, display mode, query count or data retention.

A personal Dhan/Upstox account is not an acceptable production data backend for all StockPilot customers. It may be used for private development only where the provider's own terms allow that use.

## Data scope for the first release

Start with end-of-day data and a clearly labelled latest permitted snapshot/delayed quote. Add real-time streaming only if the provider agreement and budget justify it.

Required coverage:

- NSE and BSE listed equity instruments, with ETFs/indices treated as separate instrument types.
- Daily OHLCV for at least the most recent 1-year window; prefer a longer licensed history to support backtesting.
- Latest quote or latest official close with an explicit exchange timestamp and freshness label.
- Issuer identity, ISIN, exchange, exchange symbol/security code and provider instrument identifier.
- Corporate actions needed to calculate split/bonus-adjusted and dividend-adjusted return series.
- Source attribution, provider identifier, ingestion timestamp and source-as-of timestamp.

## Adapter design

Provider-specific schemas must not leak into the core domain. Adapters normalize instrument reference data, daily candles, quotes, corporate actions and financial facts.

A provider adapter must expose its capability set (NSE/BSE coverage, history depth, intervals, quote delay, corporate actions, fundamentals), and must reject requests beyond the licensed scope.

## Ingestion controls

- Idempotent upserts with provider/source provenance.
- Request budgets, rate limits, timeouts and bounded retries.
- Instrument mapping validation; ticker symbols are not globally unique identifiers.
- OHLC invariants: low <= open/close <= high; volume must be non-negative.
- Exchange trading calendar and timezone handling (Asia/Kolkata).
- Quarantine and manual reconciliation for suspicious records.
- Raw payload retention only where contractually permitted.
- Explicit distinction between raw, split-adjusted and total-return price bases.

## Launch gate

Do not enable paid customer-facing market-data features until licensing and redistribution terms have been reviewed and approved for the exact use case. A developer key or an inexpensive personal plan is not sufficient evidence of commercial rights.
