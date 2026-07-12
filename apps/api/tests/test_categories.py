def test_list_categories(client):
    response = client.get("/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    slugs = {c["slug"] for c in data}
    assert "earrings" in slugs
    assert "necklaces" in slugs
