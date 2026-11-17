# API conventions

Base path: `/api/v1`.

- REST resources use plural nouns.
- Validate input with DTOs.
- Use ISO 8601 timestamps and explicit timezone offsets.
- Paginate collection endpoints.
- Return source and data-as-of metadata for market records.
- Use consistent error envelopes and request correlation IDs.
- Enforce user ownership and subscription entitlements on the server.
- Keep provider credentials and internal analytics endpoints private.

Planned endpoint groups: auth, users, companies, instruments, market, fundamentals, analysis, forecasts, IPOs, news, portfolios, watchlists, alerts, reports, subscriptions and admin. The foundation currently exposes `GET /api/v1/market-data/providers` to report configured provider capabilities; it returns `not_configured` until a licensed adapter is registered.

Every market history response identifies instrument, interval, price basis, currency, source/provider, data-as-of and ingestion/update time. Historical observations carry exchange trading dates.
