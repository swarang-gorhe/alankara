from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "aiConfigured" in data


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Alankara API"


def test_app_registers_multipart_routes():
    """FastAPI registers File/Form routes at import time; missing python-multipart
    used to crash CI before any test ran."""
    paths = {route.path for route in app.routes}
    assert "/admin/inventory/import" in paths
    assert "/admin/products/analyze-image" in paths
