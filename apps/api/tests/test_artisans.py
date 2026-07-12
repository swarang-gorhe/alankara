def test_list_artisans(client):
    response = client.get("/artisans")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    assert data[0]["slug"]
    assert data[0]["yearsExperience"] >= 1
