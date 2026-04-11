import pytest
import time
from fastapi.testclient import TestClient
from main import app, ZONES, CAPACITIES

client = TestClient(app)

def test_health_check():
    """Test the basic health check endpoint to ensure API is online."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_densities():
    """Test the density stream ensures correct zones and schemas are returned."""
    time.sleep(0.6)
    response = client.get("/zones/density")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(ZONES)
    
    for zone_data in data:
        assert zone_data["zone"] in ZONES
        assert "current_occupancy" in zone_data
        assert "density_percentage" in zone_data
        assert "status" in zone_data

def test_get_route_valid():
    """Test Dijkstra pathfinding algorithms on generic edges."""
    time.sleep(0.6)
    response = client.get("/route?start=Gates&end=Seating")
    assert response.status_code == 200
    data = response.json()
    assert "route" in data
    assert "total_cost" in data
    assert data["route"][0] == "Gates"
    assert data["route"][-1] == "Seating"

def test_get_route_invalid_zones():
    """Ensure HTTP 400 errors are returned if a bad query is passed to routing."""
    time.sleep(0.6)
    response = client.get("/route?start=Nowhere&end=Void")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid start or end zone"
