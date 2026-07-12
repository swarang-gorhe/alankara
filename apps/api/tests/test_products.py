def test_list_products(client):
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    product = data["items"][0]
    assert "slug" in product
    assert "categorySlug" in product
    assert "variants" in product


def test_list_products_filter_by_category(client):
    response = client.get("/products", params={"category": "earrings"})
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["categorySlug"] == "earrings"


def test_list_products_search(client):
    response = client.get("/products", params={"q": "jhumka"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_product_by_slug(client):
    response = client.get("/products/chandni-jhumka")
    assert response.status_code == 200
    product = response.json()
    assert product["slug"] == "chandni-jhumka"
    assert product["name"] == "Chandni Jhumka"
    assert len(product["relatedProducts"]) >= 1


def test_get_product_not_found(client):
    response = client.get("/products/does-not-exist")
    assert response.status_code == 404
