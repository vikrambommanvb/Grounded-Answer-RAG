"""Health check API tests."""

def test_health_check(client):
    """Test /api/health endpoint returns 200 and expected payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "The Grounded Answer"
    assert "version" in data
    assert "default_provider" in data
