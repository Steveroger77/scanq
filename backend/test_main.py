import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_not_found():
    """Test that the root endpoint correctly returns a 404 (since we only have /upload and /ask)"""
    response = client.get("/")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}

def test_ask_validation_error():
    """Test that sending an empty request to /ask correctly triggers a validation error"""
    response = client.post("/ask", json={})
    assert response.status_code == 422 # Unprocessable Entity (FastAPI validation error)
