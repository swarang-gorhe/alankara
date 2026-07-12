from __future__ import annotations


def test_health_without_ai_keys(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "aiConfigured" in data
    assert data["aiConfigured"] is False


def test_faq_chat_returns_503_without_api_key(client):
    response = client.post(
        "/chat/faq",
        json={"message": "How long does shipping take?"},
    )
    assert response.status_code == 503
    assert "AI services unavailable" in response.json()["detail"]


def test_review_insights_public(client):
    response = client.get("/reviews/insights")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "positiveThemes" in data


def test_admin_ai_agent_requires_auth(client):
    response = client.post(
        "/admin/ai/agents/product",
        json={"prompt": "Draft SEO for test product"},
    )
    assert response.status_code == 401


def test_admin_reindex_requires_auth(client):
    response = client.post("/admin/ai/reindex")
    assert response.status_code == 401


def test_admin_ai_agent_returns_503_without_key(client, admin_headers):
    response = client.post(
        "/admin/ai/agents/product",
        headers=admin_headers,
        json={"action": "luxury-description"},
    )
    assert response.status_code == 503


def test_admin_ai_actions_list(client, admin_headers):
    response = client.get("/admin/ai/actions", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "product" in data["agents"]
    assert len(data["agents"]["product"]) >= 1
