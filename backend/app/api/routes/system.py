"""System configuration and operational status endpoint."""
from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System Configuration"])

class SystemConfigResponse(BaseModel):
    app_name: str
    version: str
    environment: str
    default_provider: str
    groq_configured: bool
    available_providers: List[str]
    retrieval_top_k: int
    similarity_threshold: float
    hybrid_retrieval: bool
    database_target: str
    security_mode: str = "strictly_isolated"

@router.get("/config", response_model=SystemConfigResponse)
def get_system_config() -> SystemConfigResponse:
    """
    Retrieve operational parameters and provider availability.
    All credentials and secrets are strictly redacted.
    """
    return SystemConfigResponse(
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        default_provider=settings.DEFAULT_PROVIDER,
        groq_configured=bool(settings.GROQ_API_KEY.strip()),
        available_providers=["mock", "groq"],
        retrieval_top_k=settings.RETRIEVAL_TOP_K,
        similarity_threshold=settings.SIMILARITY_THRESHOLD,
        hybrid_retrieval=settings.HYBRID_RETRIEVAL,
        database_target="data/sqlite.db",
        security_mode="strictly_isolated"
    )
