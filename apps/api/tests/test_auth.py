def test_admin_login_and_ping(client):
    login = client.post(
        "/auth/login",
        json={"email": "admin@alankara.local", "password": "admin-dev-only"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["role"] == "admin"

    ping = client.get("/auth/admin/ping", headers={"Authorization": f"Bearer {token}"})
    assert ping.status_code == 200
    assert ping.json()["status"] == "ok"


def test_admin_ping_requires_admin(client):
    login = client.post(
        "/auth/login",
        json={"email": "shopper@example.com", "password": "customer-dev"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    ping = client.get("/auth/admin/ping", headers={"Authorization": f"Bearer {token}"})
    assert ping.status_code == 403
