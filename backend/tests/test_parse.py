"""Unit tests for POST /api/parse endpoint."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

# We do a late import so that config validation doesn't blow up during collection.
# Tests set env vars before importing the app.
import os
os.environ.setdefault("EXA_API_KEY", "test-exa-key")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-supabase-key")

from app.main import app  # noqa: E402

client = TestClient(app)


# ── Valid input ───────────────────────────────────────────────────────────────

VALID_PAYLOAD = {
    "project_type": "Web App",
    "scale": "small",
    "pricing_model": "free",
    "preferred_language": "Python",
    "platform_type": ["Web App"],
    "output_format": "table",
    "pinned_techs": ["React", "FastAPI"],
    "notes": "Simple dashboard for internal use",
}


def test_parse_valid_input():
    """POST /api/parse with valid data returns 200 and search queries."""
    resp = client.post("/api/parse", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    data = resp.json()
    assert "search_queries" in data
    assert 4 <= len(data["search_queries"]) <= 6
    assert data["project_type"] == "Web App"
    assert data["preferred_language"] == "python"  # normalised to lowercase


def test_parse_generates_language_query():
    """When preferred_language is set, a language-specific query should appear."""
    resp = client.post("/api/parse", json=VALID_PAYLOAD)
    queries = resp.json()["search_queries"]
    assert any("python" in q.lower() for q in queries)


def test_parse_generates_pinned_tech_query():
    """When pinned_techs are provided, a pinned-tech integration query should appear."""
    resp = client.post("/api/parse", json=VALID_PAYLOAD)
    queries = resp.json()["search_queries"]
    assert any("react" in q.lower() or "fastapi" in q.lower() for q in queries)


# ── Missing / invalid fields ─────────────────────────────────────────────────

def test_parse_missing_project_type():
    """project_type is required — omitting it should return 422."""
    payload = {**VALID_PAYLOAD}
    del payload["project_type"]
    resp = client.post("/api/parse", json=payload)
    assert resp.status_code == 422


def test_parse_invalid_scale():
    """Invalid scale value should return 422."""
    payload = {**VALID_PAYLOAD, "scale": "gigantic"}
    resp = client.post("/api/parse", json=payload)
    assert resp.status_code == 422


def test_parse_defaults():
    """Only project_type is strictly required — other fields have sensible defaults."""
    resp = client.post("/api/parse", json={"project_type": "API Service"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["scale"] == "small"
    assert data["pricing_model"] == "free"
    assert len(data["search_queries"]) >= 4


# ── Edge cases ────────────────────────────────────────────────────────────────

def test_parse_dedupes_pinned_techs():
    """Duplicate pinned techs should be deduped."""
    payload = {**VALID_PAYLOAD, "pinned_techs": ["React", "React", "FastAPI"]}
    resp = client.post("/api/parse", json=payload)
    data = resp.json()
    assert data["pinned_techs"] == ["React", "FastAPI"]


def test_parse_trims_whitespace():
    """Leading/trailing whitespace in string fields should be trimmed."""
    payload = {**VALID_PAYLOAD, "project_type": "  Web App  ", "preferred_language": "  TypeScript  "}
    resp = client.post("/api/parse", json=payload)
    data = resp.json()
    assert data["project_type"] == "Web App"
    assert data["preferred_language"] == "typescript"
