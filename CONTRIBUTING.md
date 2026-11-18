# Contributing

1. Create a focused branch from the agreed integration branch.
2. Keep changes scoped to one feature or fix.
3. Update documentation for architectural and API changes.
4. Run lint, type-checks, tests and builds locally.
5. Open a pull request with implementation and verification evidence.
6. Keep `main` releasable.

Branch prefixes: `feature/`, `fix/`, `docs/`, `chore/`.

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `build:`.

Financial data requirements: preserve source and as-of timestamps; never invent prices; do not commit licensed data or provider credentials; test corporate-action calculations; distinguish observed data from forecasts.

Never commit secrets, customer data, access tokens, broker credentials or production database dumps.
