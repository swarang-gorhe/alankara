def test_get_empty_cart_sets_session_cookie(client):
    response = client.get("/cart")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["itemCount"] == 0
    assert "alankara_cart_session" in response.cookies


def test_add_update_remove_cart_item(client):
    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")

    add = client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert add.status_code == 200
    data = add.json()
    assert data["itemCount"] == 1
    assert data["items"][0]["productSlug"] == "chandni-jhumka"
    item_id = data["items"][0]["id"]

    update = client.patch(
        f"/cart/items/{item_id}",
        json={"quantity": 2},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert update.status_code == 200
    assert update.json()["items"][0]["quantity"] == 2

    remove = client.delete(
        f"/cart/items/{item_id}",
        cookies={"alankara_cart_session": session_cookie},
    )
    assert remove.status_code == 200
    assert remove.json()["itemCount"] == 0


def test_add_cart_item_out_of_stock_variant(client):
    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")

    response = client.post(
        "/cart/items",
        json={"variantId": "does-not-exist", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert response.status_code == 404


def test_add_cart_item_exceeds_stock(client):
    cart = client.get("/cart")
    session_cookie = cart.cookies.get("alankara_cart_session")

    response = client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 999},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert response.status_code == 400


def test_merge_guest_cart_on_login(client):
    guest_cart = client.get("/cart")
    session_cookie = guest_cart.cookies.get("alankara_cart_session")

    add = client.post(
        "/cart/items",
        json={"variantId": "var-001-a", "quantity": 1},
        cookies={"alankara_cart_session": session_cookie},
    )
    assert add.status_code == 200

    login = client.post(
        "/auth/login",
        json={"email": "shopper@example.com", "password": "customer-dev"},
    )
    token = login.json()["access_token"]

    merged = client.get(
        "/cart",
        cookies={"alankara_cart_session": session_cookie},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert merged.status_code == 200
    assert merged.json()["itemCount"] == 1
