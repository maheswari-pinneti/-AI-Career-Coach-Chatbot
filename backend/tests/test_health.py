def test_health_check_endpoint(client):
    """Test health check endpoint returns 200 OK and expected JSON schema."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.get_json()

    assert data is not None
    assert data["success"] is True
    assert data["message"] == "AI Career Coach API is running"
    assert data["version"] == "1.0.0"


def test_404_error_handler(client):
    """Test non-existent route triggers centralized JSON 404 handler."""
    response = client.get("/api/v1/non_existent_route")
    assert response.status_code == 404
    data = response.get_json()

    assert data is not None
    assert data["success"] is False
    assert data["error"] == "Not Found"
