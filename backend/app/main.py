"""Main FastAPI application for The Grounded Answer."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.database.session import init_db
from app.api.routes import health, chat, policies, documents, evaluation, system

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.APP_ENV})")
    init_db()
    
    # Safe database verification & automatic population on ephemeral containers
    try:
        from app.database.models import get_all_clauses
        if len(get_all_clauses()) == 0:
            logger.info("Database empty on startup; auto-populating official policy corpus...")
            from app.ingestion.service import run_ingestion
            from pathlib import Path
            manual_path = Path(settings.POLICY_DOCS_DIR) / "policy-manual.md"
            amd_path = Path(settings.POLICY_DOCS_DIR) / "Amendment No. 2026-01.md"
            if manual_path.exists() and amd_path.exists():
                run_ingestion(manual_path, amd_path)
                logger.info("Official policy corpus auto-ingested successfully.")
    except Exception as e:
        logger.error(f"Error verifying policy database on startup: {e}")
        
    yield
    logger.info("Shutting down application")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Evidence-Grounded Policy Intelligence Assistant for Calder County Household Support Program",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(policies.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api")
app.include_router(system.router, prefix="/api")

# Serve built frontend static files if present, or return API status
import os
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{page}")
    async def serve_spa_page(page: str):
        allowed_pages = {"assistant", "explorer", "timeline", "evaluation", "documents", "settings", "about"}
        if page in allowed_pages:
            return FileResponse(os.path.join(frontend_dist, "index.html"))
        target = os.path.join(frontend_dist, page)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        raise HTTPException(status_code=404, detail="Not Found")
else:
    @app.get("/")
    async def root_status():
        return {
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "description": "FastAPI RAG Policy Engine for Calder County Household Support Program",
            "documentation": "/docs",
            "health_check": "/api/health",
            "policy_summary": "/api/policies/summary",
            "frontend_url": "https://the-grounded-answer.vercel.app",
        }
