def test_checkout_creates_pending_payment_order(client):
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
    assert data["order"]["status"] == "pending_payment"
    assert data["order"]["total"]["amount"] == 4800
    assert len(data["order"]["items"]) == 1
    assert data["payment"]["status"] == "coming_soon"
    assert data["payment"]["provider"] == "stub"

    cleared = client.get("/cart", cookies={"alankara_cart_session": session_cookie})
    assert cleared.json()["itemCount"] == 0


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
