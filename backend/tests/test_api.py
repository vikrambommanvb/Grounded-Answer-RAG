"""Comprehensive integration tests for all FastAPI REST endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ingestion.service import run_ingestion
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANUAL_PATH = REPO_ROOT / "docs" / "policy" / "policy-manual.md"
AMENDMENT_PATH = REPO_ROOT / "docs" / "policy" / "Amendment No. 2026-01.md"

@pytest.fixture(scope="module")
def client():
    # Ingest database for API tests
    run_ingestion(MANUAL_PATH, AMENDMENT_PATH)
    with TestClient(app) as test_client:
        yield test_client

def test_health_endpoint(client):
    """GET /api/health returns 200 and healthy payload."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "default_provider" in data

def test_chat_ask_grounded_answer(client):
    """POST /api/chat/ask returns grounded answer with citations."""
    payload = {
        "question": "What is the maximum amount of countable resources a household may hold to qualify for assistance?",
        "provider": "mock"
    }
    resp = client.post("/api/chat/ask", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ANSWERED"
    assert "$4,000" in data["direct_answer"]
    assert len(data["supporting_citations"]) > 0
    assert any(b["clause_id"] == "§2.4.1" for b in data["supporting_citations"])

def test_chat_ask_refusal(client):
    """POST /api/chat/ask returns structured refusal for apparent gap."""
    payload = {
        "question": "How is the needs figure calculated for full-time students under §7.1.3?",
        "provider": "mock"
    }
    resp = client.post("/api/chat/ask", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "REFUSED"
    assert data["refusal_details"] is not None
    assert data["refusal_details"]["category"] == "APPARENT_GAP"
    assert "§7.1.3" in data["refusal_details"]["reason"]

def test_chat_ask_empty_question(client):
    """POST /api/chat/ask validates empty question with 400 error."""
    resp = client.post("/api/chat/ask", json={"question": "   "})
    assert resp.status_code == 400

def test_policies_summary(client):
    """GET /api/policies returns high level corpus stats."""
    resp = client.get("/api/policies")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_parts"] == 12
    assert data["total_clauses"] == 148
    assert data["amendment_items_count"] == 9

def test_policies_clauses_listing_and_filtering(client):
    """GET /api/policies/clauses supports part and keyword filtering."""
    # List all
    resp_all = client.get("/api/policies/clauses")
    assert resp_all.status_code == 200
    assert len(resp_all.json()) == 148
    
    # Filter by Part 4
    resp_part = client.get("/api/policies/clauses?part=4")
    assert resp_part.status_code == 200
    clauses_part4 = resp_part.json()
    assert all(c["part_number"] == 4 for c in clauses_part4)
    
    # Filter by search keyword "disregard"
    resp_search = client.get("/api/policies/clauses?query=disregard")
    assert resp_search.status_code == 200
    search_results = resp_search.json()
    assert len(search_results) > 0
    assert any("§6.4.1" in c["clause_id"] for c in search_results)

def test_policies_clause_detail(client):
    """GET /api/policies/clauses/{id} returns details and 404 on missing."""
    resp = client.get("/api/policies/clauses/§4.3.2")
    assert resp.status_code == 200
    data = resp.json()
    assert data["clause"]["clause_id"] == "§4.3.2"
    assert data["is_amended"] is True
    assert data["amendment_action"] is not None
    assert data["amendment_action"]["new_text"] == "14 calendar days"
    
    # Non-existent clause
    resp_404 = client.get("/api/policies/clauses/§99.9.9")
    assert resp_404.status_code == 404

def test_policies_timeline(client):
    """GET /api/policies/timeline returns chronological progression."""
    resp = client.get("/api/policies/timeline")
    assert resp.status_code == 200
    events = resp.json()
    assert len(events) >= 3
    dates = [e["event_date"] for e in events]
    assert "2025-12-31" in dates
    assert "2026-03-01" in dates

def test_documents_listing_and_detail(client):
    """GET /api/documents and /api/documents/{id} with traversal protection."""
    resp = client.get("/api/documents")
    assert resp.status_code == 200
    docs = resp.json()
    assert len(docs) == 2
    
    # Valid document
    resp_doc = client.get("/api/documents/HSP-MANUAL-2025-12")
    assert resp_doc.status_code == 200
    doc_detail = resp_doc.json()
    assert "Calder County" in doc_detail["raw_content"]
    assert doc_detail["document"]["document_id"] == "HSP-MANUAL-2025-12"
    
    # Invalid / Path traversal attempts
    resp_bad = client.get("/api/documents/../../etc/passwd")
    assert resp_bad.status_code in (404, 403)

def test_system_config_security(client):
    """GET /api/system/config returns safe operational params with no leaked secrets."""
    resp = client.get("/api/system/config")
    assert resp.status_code == 200
    data = resp.json()
    assert data["app_name"] == "The Grounded Answer"
    assert "available_providers" in data
    assert "mock" in data["available_providers"]
    assert "groq" in data["available_providers"]
    # Guarantee no API keys are returned in response
    assert "api_key" not in str(data).lower()
    assert "secret" not in str(data).lower()

def test_evaluation_summary_and_run(client):
    """GET /api/evaluation/summary and POST /api/evaluation/run execute benchmark."""
    resp = client.get("/api/evaluation/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_tests"] == 10
    assert data["passed_tests"] >= 8
    assert len(data["results"]) == 10
    
    # Trigger run endpoint
    resp_run = client.post("/api/evaluation/run", json={"provider": "mock"})
    assert resp_run.status_code == 200
    data_run = resp_run.json()
    assert data_run["total_tests"] == 10
