def test_recommendations_fallback(client):
    response = client.get("/recommendations?surface=home")
    assert response.status_code == 200
    data = response.json()
    assert "headline" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) >= 1


def test_event_logging_and_recommendations(client):
    cart = client.get("/cart")
    cookie = cart.cookies.get("alankara_cart_session")
    logged = client.post(
        "/events",
        json={"productId": "prod-001", "eventType": "viewed"},
        cookies={"alankara_cart_session": cookie},
    )
    assert logged.status_code == 200
    recs = client.get("/recommendations?surface=pdp&product_id=prod-001", cookies={"alankara_cart_session": cookie})
    assert recs.status_code == 200
    ids = {item["id"] for item in recs.json()["items"]}
    assert "prod-001" not in ids


def test_store_settings_roundtrip(client, admin_headers):
    current = client.get("/admin/settings", headers=admin_headers)
    assert current.status_code == 200
    updated = client.put(
        "/admin/settings",
        headers=admin_headers,
        json={"lowStockThreshold": 8, "currency": "INR", "taxRateBps": 0},
    )
    assert updated.status_code == 200
    assert updated.json()["lowStockThreshold"] == 8


def test_inventory_csv_export_import(client, admin_headers):
    exported = client.get("/admin/inventory/export", headers=admin_headers)
    assert exported.status_code == 200
    assert "sku" in exported.text

    imported = client.post(
        "/admin/inventory/import",
        headers=admin_headers,
        files={"file": ("stock.csv", "sku,stock\nKDD-BIG-MS,11\n", "text/csv")},
    )
    assert imported.status_code == 200
    assert imported.json()["updated"] >= 1


def test_review_submits_pending(client):
    login = client.post(
        "/auth/login",
        json={"email": "reviewer@example.com", "password": "customer-dev"},
    )
    token = login.json()["access_token"]
    response = client.post(
        "/reviews",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "productId": "prod-001",
            "rating": 5,
            "title": "Soft and light",
            "text": "These sat comfortably through a long evening.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["approved"] is False
    assert data["status"] == "pending"

    public = client.get("/reviews", params={"product_id": "prod-001"})
    ids = {item["id"] for item in public.json()["items"]}
    assert data["id"] not in ids


def test_analyze_image_fails_gracefully(client, admin_headers):
    response = client.post(
        "/admin/products/analyze-image",
        headers=admin_headers,
        files={"file": ("piece.jpg", b"not-an-image", "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.json()["ok"] is False
    assert "error" in response.json()


def test_staff_login_is_admin(client):
    login = client.post(
        "/auth/login",
        json={"email": "staff@alankara.local", "password": "staff-dev-only"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    ping = client.get("/auth/admin/ping", headers={"Authorization": f"Bearer {token}"})
    assert ping.status_code == 200
