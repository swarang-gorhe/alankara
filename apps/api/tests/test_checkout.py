"""Checkout stock reservation, recommendations, settings, and inventory CSV."""


def test_checkout_creates_paid_order_and_decrements_stock(client):
    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")

    added = client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert added.status_code == 200
    stock_before = added.json()["items"][0]["stock"]
    expected_total = added.json()["subtotal"]["amount"]

    checkout = client.post(
        "/checkout",
        json={
            "shippingAddress": {
                "name": "Priya Sharma",
                "email": "priya@example.com",
                "phone": "+91 98765 43210",
                "line1": "12 Lotus Lane",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postalCode": "400001",
                "country": "IN",
            }
        },
        cookies={"alankara_cart_session": session_cookie},
    )
    assert checkout.status_code == 200
    data = checkout.json()
    assert data["order"]["status"] == "paid"
    assert data["order"]["paymentStatus"] == "paid"
    assert data["order"]["total"]["amount"] == expected_total
    assert len(data["order"]["items"]) == 1
    assert data["payment"]["provider"] == "test"
    assert data["payment"]["status"] == "succeeded"

    cleared = client.get("/cart", cookies={"alankara_cart_session": session_cookie})
    assert cleared.json()["itemCount"] == 0

    restock = client.get("/cart")
    restock_cookie = restock.cookies.get("alankara_cart_session")
    after = client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": restock_cookie},
    )
    assert after.status_code == 200
    assert after.json()["items"][0]["stock"] == stock_before - 1


def test_checkout_empty_cart_fails(client):
    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")

    response = client.post(
        "/checkout",
        json={
            "shippingAddress": {
                "name": "Priya Sharma",
                "email": "priya@example.com",
                "line1": "12 Lotus Lane",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postalCode": "400001",
            }
        },
        cookies={"alankara_cart_session": session_cookie},
    )
    assert response.status_code == 400


def test_checkout_last_unit_rejects_second_buyer(client, admin_headers):
    created = client.post(
        "/admin/products",
        headers=admin_headers,
        json={
            "slug": "last-unit-product",
            "name": "Last Unit Product",
            "description": "Used to verify atomic stock reservation",
            "categoryId": "cat-cloth-earrings",
            "primaryMaterial": "cotton",
            "minPrice": 100,
            "status": "published",
        },
    )
    assert created.status_code == 201, created.text
    product_id = created.json()["id"]
    variant = client.post(
        f"/admin/products/{product_id}/variants",
        headers=admin_headers,
        json={"sku": "LAST-UNIT-001", "priceAmount": 100, "stock": 1},
    )
    assert variant.status_code == 201
    variant_id = variant.json()["id"]

    def place_order(email: str) -> int:
        guest = client.get("/cart")
        cookie = guest.cookies.get("alankara_cart_session")
        added = client.post(
            "/cart/items",
            json={"variantId": variant_id, "quantity": 1},
            cookies={"alankara_cart_session": cookie},
        )
        if added.status_code != 200:
            return added.status_code
        result = client.post(
            "/checkout",
            json={
                "shippingAddress": {
                    "name": "Shopper",
                    "email": email,
                    "line1": "1 Atelier Lane",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "postalCode": "400001",
                    "country": "IN",
                }
            },
            cookies={"alankara_cart_session": cookie},
        )
        return result.status_code

    first = place_order("one@example.com")
    second = place_order("two@example.com")
    assert first == 200
    assert second in (400, 409)
