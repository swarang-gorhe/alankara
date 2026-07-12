def test_list_categories(client):
    response = client.get("/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    slugs = {c["slug"] for c in data}
    assert "cloth-earrings" in slugs
    assert "fabric-necklaces" in slugs
    assert "sustainable-fashion-accessories" in slugs
