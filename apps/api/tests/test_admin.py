"""Admin API integration tests."""

import pytest


@pytest.fixture
def admin_headers(client):
    login = client.post(
        "/auth/login",
        json={"email": "admin@alankara.local", "password": "admin-dev-only"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_stats(client, admin_headers):
    response = client.get("/admin/dashboard/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "ordersCount" in data
    assert "productsCount" in data
    assert "lowStockAlerts" in data


def test_admin_requires_auth(client):
    response = client.get("/admin/dashboard/stats")
    assert response.status_code == 401


def test_admin_products_crud(client, admin_headers):
    listing = client.get("/admin/products", headers=admin_headers)
    assert listing.status_code == 200
    assert listing.json()["total"] >= 1

    created = client.post(
        "/admin/products",
        headers=admin_headers,
        json={
            "slug": "test-admin-product",
            "name": "Test Admin Product",
            "description": "Created via admin API test",
            "categoryId": "cat-fabric-necklaces",
            "primaryMaterial": "cotton",
            "minPrice": 500000,
        },
    )
    assert created.status_code == 201
    product_id = created.json()["id"]

    variant = client.post(
        f"/admin/products/{product_id}/variants",
        headers=admin_headers,
        json={
            "sku": "TEST-ADMIN-SKU-001",
            "size": "One size",
            "priceAmount": 500000,
            "stock": 3,
        },
    )
    assert variant.status_code == 201

    updated = client.put(
        f"/admin/products/{product_id}",
        headers=admin_headers,
        json={"featured": True},
    )
    assert updated.status_code == 200
    assert updated.json()["featured"] is True

    deleted = client.delete(f"/admin/products/{product_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_admin_discounts_crud(client, admin_headers):
    created = client.post(
        "/admin/discounts",
        headers=admin_headers,
        json={
            "code": "TEST10",
            "type": "percentage",
            "value": 10,
            "active": True,
        },
    )
    assert created.status_code == 201
    discount_id = created.json()["id"]
    assert created.json()["code"] == "TEST10"

    listing = client.get("/admin/discounts", headers=admin_headers)
    assert listing.status_code == 200
    assert any(d["id"] == discount_id for d in listing.json()["items"])

    updated = client.put(
        f"/admin/discounts/{discount_id}",
        headers=admin_headers,
        json={"value": 15},
    )
    assert updated.status_code == 200
    assert updated.json()["value"] == 15

    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")
    client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )

    validate = client.post(
        "/discounts/validate",
        json={"code": "TEST10"},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert validate.status_code == 200
    assert validate.json()["valid"] is True
    assert validate.json()["discountAmount"] == 1500

    deleted = client.delete(f"/admin/discounts/{discount_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_checkout_applies_discount(client, admin_headers):
    created = client.post(
        "/admin/discounts",
        headers=admin_headers,
        json={"code": "CHECKOUT5", "type": "flat", "value": 500, "active": True},
    )
    assert created.status_code == 201

    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")
    client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )

    checkout = client.post(
        "/checkout",
        json={
            "shippingAddress": {
                "name": "Priya Sharma",
                "email": "priya@example.com",
                "line1": "12 Lotus Lane",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postalCode": "400001",
            },
            "discountCode": "CHECKOUT5",
        },
        cookies={"alankara_cart_session": session_cookie},
    )
    assert checkout.status_code == 200
    order = checkout.json()["order"]
    assert order["discountCode"] == "CHECKOUT5"
    assert order["discountAmount"]["amount"] == 500
    assert order["total"]["amount"] == order["subtotal"]["amount"] - 500

    client.delete(f"/admin/discounts/{created.json()['id']}", headers=admin_headers)


def test_admin_faq_crud(client, admin_headers):
    created = client.post(
        "/admin/faq",
        headers=admin_headers,
        json={
            "slug": "test-shipping-time",
            "question": "How long does shipping take?",
            "answer": "3–5 business days across India.",
            "category": "shipping",
        },
    )
    assert created.status_code == 201
    faq_id = created.json()["id"]

    updated = client.put(
        f"/admin/faq/{faq_id}",
        headers=admin_headers,
        json={"answer": "2–4 business days across India."},
    )
    assert updated.status_code == 200

    listing = client.get("/admin/faq", headers=admin_headers)
    assert listing.status_code == 200

    deleted = client.delete(f"/admin/faq/{faq_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_admin_review_moderation(client, admin_headers):
    reviews = client.get("/admin/reviews?approved=true", headers=admin_headers)
    assert reviews.status_code == 200
    items = reviews.json()["items"]
    if not items:
        pytest.skip("No reviews in seed data")

    review_id = items[0]["id"]
    hidden = client.patch(
        f"/admin/reviews/{review_id}",
        headers=admin_headers,
        json={"approved": False},
    )
    assert hidden.status_code == 200
    assert hidden.json()["approved"] is False

    restored = client.patch(
        f"/admin/reviews/{review_id}",
        headers=admin_headers,
        json={"approved": True},
    )
    assert restored.status_code == 200


def test_admin_orders_list(client, admin_headers):
    response = client.get("/admin/orders", headers=admin_headers)
    assert response.status_code == 200
    assert "items" in response.json()
