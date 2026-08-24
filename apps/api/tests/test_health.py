from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "aiConfigured" in data


def test_root():
    with TestClient(app) as client:
        response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Alankara API"


def test_app_registers_multipart_routes():
    """FastAPI registers File/Form routes at import time; missing python-multipart
    used to crash CI before any test ran."""
    paths = {getattr(route, "path", None) for route in app.routes}
    paths.discard(None)
    assert "/admin/inventory/import" in paths
    assert "/admin/products/analyze-image" in paths
