# StockPilot AI Roadmap

## Delivery principles

- Deliver in small, reviewable phases.
- Keep `main` releasable.
- Require working verification before closing a phase.
- Obtain licensing for the intended commercial data use before displaying or redistributing market data.
- Forecast recommendations remain disabled until out-of-sample validation is complete.

## Phase 0 — Foundation

- [x] Repository conventions and monorepo skeleton
- [x] Next.js web application shell
- [x] NestJS API liveness endpoint and Swagger
- [x] Python analytics service skeleton
- [x] PostgreSQL and Prisma initial domain schema
- [x] Redis local infrastructure
- [x] Environment example and secret hygiene
- [ ] Local runtime verification
- [ ] Database migration generated and tested
- [ ] CI workflows and automated checks
- [ ] Authentication implementation

**Exit gate:** local stack boots, health checks pass, migration applies cleanly, lint/type checks/build pass, and setup instructions are reproducible.

## Phase 1 — Market data

- [ ] Provider licensing and commercial-use review
- [ ] NSE/BSE exchange and instrument reference data
- [ ] Issuer-to-instrument mapping
- [ ] Provider adapter interface
- [ ] Historical OHLCV ingestion
- [ ] Data provenance and freshness
- [ ] Validation, quarantine and reconciliation
- [ ] Company search and history APIs

**Exit gate:** a permitted source supplies validated data and the API returns traceable history. No scraping or redistribution without permission.

## Phase 2 — Stock research

- [ ] Company profiles and financial statements
- [ ] Financial ratios and technical indicators
- [ ] Peer and benchmark comparisons
- [ ] Research scoring with evidence and data coverage

## Phase 3 — Quantitative intelligence

- [ ] Statistical baselines and feature engineering
- [ ] Walk-forward backtesting
- [ ] Calibrated prediction intervals
- [ ] Forecast evaluation and model registry
- [ ] AI explanation of structured outputs

## Phase 4 — IPO and news

- [ ] IPO calendar and official documents
- [ ] Subscription snapshots where licensed
- [ ] Prospectus analysis with source references
- [ ] News ingestion and attribution

## Phase 5 — Investor workspace

- [ ] Portfolios and transaction ledger
- [ ] Corporate-action-aware holdings
- [ ] Watchlists and alerts
- [ ] PDF and spreadsheet reports

## Phase 6 — SaaS operations

- [ ] Plans and entitlements
- [ ] Payment integration
- [ ] Billing and invoices
- [ ] Admin and provider monitoring

## Phase 7 — Production readiness

- [ ] Security and load testing
- [ ] Backup restoration
- [ ] Provider and regulatory review
- [ ] User acceptance testing
- [ ] Production deployment
