"""Configuration and environment settings."""
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    """Application settings schema."""
    APP_NAME: str = "The Grounded Answer"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://grounded-answer-rag.vercel.app",
        "https://grounded-answer-rag.onrender.com",
    ]
    CORS_ORIGIN_REGEX: str = r"^https:\/\/.*\.vercel\.app$"
    
    # Storage
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/sqlite.db"
    VECTOR_STORE_DIR: str = str(BASE_DIR / "data" / "vector_store")
    POLICY_DOCS_DIR: str = str(BASE_DIR / "docs" / "policy")
    
    # LLM Providers
    DEFAULT_PROVIDER: str = "mock"  # default deterministic provider
    
    # Provider Keys (loaded from env)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    
    # Retrieval
    RETRIEVAL_TOP_K: int = 5
    HYBRID_RETRIEVAL: bool = True
    SIMILARITY_THRESHOLD: float = 0.20
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

