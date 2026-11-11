"""Pytest configuration and test fixtures."""
import os
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

@pytest.fixture(autouse=True)
def force_mock_llm(monkeypatch):
    """Force deterministic mock provider across all automated test suites."""
    monkeypatch.setattr(settings, "DEFAULT_PROVIDER", "mock")
    monkeypatch.setenv("DEFAULT_PROVIDER", "mock")

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client
from app.main import app

