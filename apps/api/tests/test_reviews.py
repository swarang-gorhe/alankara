def test_list_reviews(client):
    response = client.get("/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    review = data["items"][0]
    assert "productSlug" in review
    assert "rating" in review


def test_list_reviews_for_product(client):
    response = client.get("/reviews", params={"product_id": "prod-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["productId"] == "prod-001"
