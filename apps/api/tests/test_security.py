"""Security regression tests — injection, auth bypass, data leakage."""

import pytest
from jose import jwt


@pytest.fixture
def admin_headers(client):
    login = client.post(
        "/auth/login",
        json={"email": "admin@alankara.local", "password": "admin-dev-only"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_admin_routes_reject_unauthenticated(client):
    response = client.get("/admin/products")
    assert response.status_code == 401


def test_admin_routes_reject_customer_token(client):
    login = client.post(
        "/auth/login",
        json={"email": "shopper@example.com", "password": "customer-dev"},
    )
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.get("/admin/dashboard/stats", headers=headers)
    assert response.status_code == 403


def test_sql_injection_search_does_not_error(client, admin_headers):
    """Malicious search strings must be parameterized, not crash or leak."""
    payload = "'; DROP TABLE products; --"
    response = client.get(
        "/admin/products",
        headers=admin_headers,
        params={"search": payload},
    )
    assert response.status_code == 200
    assert "items" in response.json()


def test_discount_validate_ignores_fake_subtotal(client, admin_headers):
    """Client cannot bypass min-order rules with a forged subtotal."""
    created = client.post(
        "/admin/discounts",
        headers=admin_headers,
        json={
            "code": "MINORDER",
            "type": "percentage",
            "value": 10,
            "active": True,
            "conditions": {"minOrderAmount": 500000},
        },
    )
    assert created.status_code == 201
    discount_id = created.json()["id"]

    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")
    client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )

    # Small cart — should fail min order even if attacker sends extra JSON fields
    response = client.post(
        "/discounts/validate",
        json={"code": "MINORDER", "subtotalAmount": 99999999},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert response.status_code == 200
    assert response.json()["valid"] is False

    client.delete(f"/admin/discounts/{discount_id}", headers=admin_headers)


def test_public_reviews_hide_user_id_and_unapproved(client):
    response = client.get("/reviews")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert "userId" not in item
        assert "approved" not in item


def test_product_update_ignores_unknown_fields(client, admin_headers):
    listing = client.get("/admin/products", headers=admin_headers)
    product_id = listing.json()["items"][0]["id"]
    response = client.put(
        f"/admin/products/{product_id}",
        headers=admin_headers,
        json={"isAdmin": True, "role": "admin"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "isAdmin" not in body
    assert "role" not in body


def test_forged_admin_jwt_rejected(client):
    from app.config import get_settings

    settings = get_settings()
    forged = jwt.encode(
        {"sub": "evil", "email": "evil@example.com", "role": "admin"},
        "wrong-secret",
        algorithm=settings.jwt_algorithm,
    )
    response = client.get(
        "/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {forged}"},
    )
    assert response.status_code == 401


def test_upload_rejects_non_image(client, admin_headers):
    response = client.post(
        "/admin/media/upload",
        headers=admin_headers,
        files={"file": ("evil.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 415
