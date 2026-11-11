"""Health check route."""
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(tags=["Health"])

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    default_provider: str
    groq_configured: bool

@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Check service health and system parameters."""
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        default_provider=settings.DEFAULT_PROVIDER,
        groq_configured=bool(settings.GROQ_API_KEY.strip())
    )
