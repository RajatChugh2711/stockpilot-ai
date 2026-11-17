# Architecture

## Style

Start with a modular monorepo and separately deployable web, API and analytics applications. Avoid premature microservices. The API owns product workflows and authorization; Python owns numerical analytics and model execution.

## Applications

- `apps/web`: Next.js investor UI. Calls the API; never accesses provider credentials or internal analytics directly.
- `apps/api`: NestJS modular API. Owns users, companies, instruments, data orchestration, portfolios, reports and billing.
- `apps/analytics`: Internal Python service for deterministic calculations, indicators, risk, models and backtesting.

## Infrastructure

- PostgreSQL: canonical application and normalized financial records.
- Redis: cache and job transport.
- BullMQ: background ingestion and report jobs (worker integration follows).
- Object storage: reports and permitted source documents.
- External providers: licensed exchange/market data and permitted news sources.

## Data flow

1. Worker retrieves data through a configured provider adapter.
2. Adapter normalizes payloads into internal contracts.
3. Validation checks identity, chronology, units and price invariants.
4. Accepted data is stored with provider, source and ingestion timestamps.
5. Analytics jobs derive indicators and research snapshots.
6. API exposes authorized, entitlement-appropriate results.
7. AI may explain structured outputs but cannot alter numerical facts.

## Domain distinction

An issuer can have multiple exchange instruments. Use one company record and separate NSE/BSE instrument records. Provider identifiers are mappings, not canonical IDs.

## Reliability

Idempotent ingestion, bounded retries, dead-letter handling, provider timeouts, immutable forecast snapshots, auditable corrections and explicit data freshness.

## Security boundaries

Browser -> API only. API -> analytics over a private service network. Workers -> providers using server-held credentials. Every user-owned resource is scoped using authenticated identity.
