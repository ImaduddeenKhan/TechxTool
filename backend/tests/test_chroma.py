"""Unit tests for the ChromaDB client wrapper."""

from __future__ import annotations

import os
import tempfile

import pytest

# Set env vars before any app imports
os.environ.setdefault("EXA_API_KEY", "test-exa-key")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-supabase-key")


@pytest.fixture(autouse=True)
def _tmp_chroma_dir(monkeypatch, tmp_path):
    """Point CHROMA_DIR to a temp directory for each test."""
    monkeypatch.setattr("app.services.chroma_client.CHROMA_DIR", str(tmp_path / "chroma_test"))
    # Reset the module-level singleton so each test gets a fresh client
    import app.services.chroma_client as cc
    cc._chroma_client = None
    cc._collection = None


def test_upsert_and_query():
    """Upsert documents and verify they are retrievable."""
    from app.services.chroma_client import query, upsert_documents

    docs = [
        "React is a popular frontend framework for building user interfaces",
        "FastAPI is a modern Python web framework with automatic OpenAPI docs",
        "PostgreSQL is a powerful open-source relational database",
    ]
    metas = [
        {"source": "curated", "filename": "test.pdf"},
        {"source": "curated", "filename": "test.pdf"},
        {"source": "curated", "filename": "test.pdf"},
    ]
    ids = ["doc1", "doc2", "doc3"]

    upsert_documents(docs, metas, ids)

    # Query for frontend-related content
    results = query("frontend framework for web apps", top_k=2)
    assert len(results["documents"]) > 0
    assert len(results["documents"]) <= 2
    # The React doc should appear first (most relevant)
    assert "react" in results["documents"][0].lower() or "frontend" in results["documents"][0].lower()


def test_upsert_idempotent():
    """Upserting the same IDs should not create duplicates."""
    from app.services.chroma_client import get_collection, upsert_documents

    docs = ["Test document about Node.js"]
    ids = ["same-id"]

    upsert_documents(docs, ids=ids)
    upsert_documents(docs, ids=ids)  # same ID

    col = get_collection()
    assert col.count() == 1


def test_distance_to_similarity():
    """Verify distance → similarity conversion."""
    from app.services.chroma_client import distance_to_similarity

    assert distance_to_similarity(0.0) == 1.0  # identical
    assert distance_to_similarity(2.0) == 0.0  # opposite
    assert abs(distance_to_similarity(1.0) - 0.5) < 0.01  # midpoint


def test_query_empty_collection():
    """Querying an empty collection should not crash."""
    from app.services.chroma_client import query

    results = query("anything", top_k=3)
    assert results["documents"] == []
    assert results["distances"] == []


def test_load_curated_pdfs_no_dir():
    """load_curated_pdfs with a non-existent dir should return 0."""
    from app.services.chroma_client import load_curated_pdfs

    count = load_curated_pdfs("/nonexistent/path")
    assert count == 0
