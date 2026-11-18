# Analytics service

Internal FastAPI service for deterministic quantitative calculations and model execution.

## Local run

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Liveness: `GET /health`
- Readiness: `GET /ready`

No stock forecast endpoints are enabled in the foundation phase.
