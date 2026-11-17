# StockPilot AI

**AI-powered stock-market research and investment intelligence for Indian markets.**

StockPilot AI is an India-focused research SaaS for NSE and BSE listed instruments. It is being developed to bring market history, company fundamentals, technical analytics, probabilistic scenarios, IPO research and portfolio tracking into one workspace.

> **Development status:** Foundation in progress. Market-data, company-analysis and forecast capabilities are not connected to a live provider yet. No live market prices or forecast-accuracy claims are presented.

## Product principles

- Separate issuer/company records from exchange-listed instruments.
- Preserve source provenance and data-as-of timestamps.
- Keep raw market prices distinct from adjusted return series.
- Calculate financial metrics deterministically; use AI only to explain verified outputs.
- Treat forecasts as uncertain distributions, never guaranteed targets.
- Respect market-data licensing before storing, displaying or redistributing source data.
- Never commit API keys, credentials, customer data or licensed datasets.

## Technology

| Area | Technology |
|---|---|
| Web | Next.js 16, React, TypeScript |
| API | NestJS 12, TypeScript |
| Analytics | Python, FastAPI |
| Database | PostgreSQL 16, Prisma ORM 7 |
| Cache/jobs | Redis, BullMQ (worker integration follows) |
| Local infrastructure | Docker Compose |
| CI | GitHub Actions |

## Monorepo layout

```text
stockpilot-ai/
├── apps/
│   ├── web/                 # Next.js investor-facing application
│   ├── api/                 # NestJS API and Swagger
│   └── analytics/           # Internal FastAPI service
├── packages/
│   ├── database/            # Prisma schema and migrations
│   └── shared-types/        # Shared TypeScript contracts
├── docs/                    # Product and engineering documentation
├── infrastructure/          # Deployment assets (future)
├── .github/workflows/       # CI workflows
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- Node.js 22.22.3
- Corepack and pnpm 9.15.5
- Python 3.11+ (only needed to run analytics outside Docker)
- Docker Desktop / Docker Engine with Compose

## Local setup

1. Clone the repository and switch to the foundation branch:

   ```bash
   git clone https://github.com/RajatChugh2711/stockpilot-ai.git
   cd stockpilot-ai
   git checkout chore/phase-0-foundation
   ```

2. Enable Corepack and activate the pinned package manager:

   ```bash
   corepack enable
   corepack prepare pnpm@9.15.5 --activate
   ```

3. Create your local environment file:

   PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:
   ```bash
   cp .env.example .env
   ```

4. Install packages. This creates `pnpm-lock.yaml`; commit that generated lockfile so installs become reproducible:

   ```bash
   pnpm install
   ```

5. Start PostgreSQL, Redis and the analytics service:

   ```bash
   pnpm infra:up
   ```

6. Generate the Prisma client and apply the initial development migration:

   ```bash
   pnpm db:generate
   pnpm db:migrate:dev
   ```

   Run migrations manually against a development database. Do not run migration commands against production without review and an approved release procedure.

7. Start the web application and API:

   ```bash
   pnpm dev
   ```

## Local endpoints

| Service | URL |
|---|---|
| Web dashboard | http://localhost:3000 |
| API liveness | http://localhost:4000/api/v1/health |
| API Swagger | http://localhost:4000/docs |
| Market-data provider status | http://localhost:4000/api/v1/market-data/providers |
| Analytics liveness | http://localhost:8000/health |
| Analytics readiness | http://localhost:8000/ready |

The API health endpoint confirms process liveness. It does not yet verify database or Redis connectivity.

## Validation

```bash
pnpm typecheck
pnpm build
pnpm test
```

The API unit tests validate the normalized daily OHLCV contract. The CI workflow also applies the initial Prisma migration to a temporary PostgreSQL 16 instance.

## Project documentation

- [Roadmap and phase exit gates](docs/ROADMAP.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE_SCHEMA.md)
- [API conventions](docs/API_CONVENTIONS.md)
- [Market-data provider strategy](docs/DATA_PROVIDER_STRATEGY.md)
- [Phase 1 market-data implementation plan](docs/PHASE_1_MARKET_DATA_PLAN.md)
- [Analytics and forecasting methodology](docs/ANALYTICS_METHODOLOGY.md)
- [Security requirements](docs/SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)

## Development status

Phase 0 establishes the repository, app shells, API documentation, analytics health endpoints, initial data-domain schema and local infrastructure. It does not yet implement authentication flows, a live provider integration, company search, historical market-data ingestion or forecasts.

Phase 1 starts only after the provider's commercial rights for the intended storage, display and derived use have been confirmed.

## Financial and data disclaimer

StockPilot AI is intended as a financial research and decision-support platform. Historical performance does not guarantee future results. Forecasts, once implemented, will be probabilistic estimates with disclosed methodology and limitations. The product will not claim guaranteed profits. Commercial launch is subject to market-data licensing and appropriate legal/compliance review in India.

## License

No open-source license has been granted. All rights are reserved unless and until a separate license is added.
