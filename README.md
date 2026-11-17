# StockPilot AI

AI-powered stock-market research and investment intelligence for Indian markets.

> **Status:** Foundation in progress. Market data, company analysis and forecasting are not implemented yet. No live prices or forecast-accuracy claims are provided.

## Principles
- Separate issuer records from exchange-listed instruments.
- Preserve source provenance and data-as-of timestamps.
- Keep raw prices distinct from adjusted return series.
- Calculate financial metrics deterministically; use AI to explain verified outputs.
- Treat forecasts as uncertain distributions, never guaranteed targets.
- Obtain explicit commercial data rights before displaying or redistributing market data.
- Never commit credentials, customer data or licensed datasets.

## Planned architecture
| Component | Responsibility | Stack |
|---|---|---|
| `apps/web` | Investor web application | Next.js, React, TypeScript |
| `apps/api` | Product API | NestJS, TypeScript |
| `apps/analytics` | Quantitative research | Python, FastAPI |
| Database | Canonical application and financial records | PostgreSQL, Prisma |
| Jobs/cache | Background work and caching | Redis, BullMQ |
| Infrastructure | Local development and deployment | Docker, AWS (planned) |

## Layout
```text
stockpilot-ai/
  apps/{web,api,analytics}/
  packages/{shared-types,api-client,ui,config}/
  docs/
  infrastructure/{docker,aws,scripts}/
  .github/{workflows,ISSUE_TEMPLATE}/
```

## Documentation
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE_SCHEMA.md)
- [API conventions](docs/API_CONVENTIONS.md)
- [Provider strategy](docs/DATA_PROVIDER_STRATEGY.md)
- [Analytics methodology](docs/ANALYTICS_METHODOLOGY.md)
- [Security](docs/SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Principles and launch gates
StockPilot AI is a financial research and decision-support product, not a source of guaranteed returns. Market data features require licensing for the exact SaaS display, storage and derived-use case. Forecasting will require documented out-of-sample evaluation before being presented to users.

## License
No open-source license has been granted. All rights reserved unless and until a license is added.
