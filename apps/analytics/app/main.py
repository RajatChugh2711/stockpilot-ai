from datetime import UTC, datetime

from fastapi import FastAPI

app = FastAPI(
    title="StockPilot AI Analytics",
    description="Internal quantitative analytics service. Forecasting is not enabled in the foundation phase.",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness endpoint: process is accepting requests."""
    return {
        "status": "ok",
        "service": "stockpilot-analytics",
        "timestamp": datetime.now(UTC).isoformat(),
    }


@app.get("/ready", tags=["health"])
def readiness() -> dict[str, str]:
    """Foundation readiness; dependency checks will be added with integrations."""
    return {"status": "ready", "capabilities": "foundation-only"}
