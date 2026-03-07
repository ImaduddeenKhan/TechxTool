"""
ChromaDB client — local persistent vector store for curated & realtime docs.

Provides:
  - upsert_documents()  — add/update docs with metadata
  - query()             — semantic search returning docs + scores
  - load_curated_pdfs() — ingest PDFs from knowledge_base/ on startup
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

from app.config import CHROMA_DIR

logger = logging.getLogger(__name__)

# ── Singleton ─────────────────────────────────────────────────────────────────

_chroma_client: chromadb.ClientAPI | None = None
_collection: Collection | None = None

COLLECTION_NAME = "tech_stack_kb"


def get_collection() -> Collection:
    """Return (and lazily create) the Chroma collection with local persistence."""
    global _chroma_client, _collection
    if _collection is None:
        persist_dir = str(Path(CHROMA_DIR).resolve())
        _chroma_client = chromadb.PersistentClient(path=persist_dir)
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},  # cosine distance → 0 = identical
        )
        logger.info(
            "Chroma collection '%s' ready (%d docs) at %s",
            COLLECTION_NAME,
            _collection.count(),
            persist_dir,
        )
    return _collection


# ── Core helpers ──────────────────────────────────────────────────────────────


def upsert_documents(
    docs: list[str],
    metadatas: list[dict[str, Any]] | None = None,
    ids: list[str] | None = None,
) -> None:
    """Add or update documents in the collection."""
    col = get_collection()
    if ids is None:
        ids = [hashlib.sha256(d.encode()).hexdigest()[:16] for d in docs]
    col.upsert(documents=docs, metadatas=metadatas, ids=ids)
    logger.info("Upserted %d documents", len(docs))


def query(
    query_text: str,
    top_k: int = 5,
) -> dict[str, Any]:
    """
    Query the collection and return results with similarity scores.

    Returns dict with keys: documents, metadatas, distances, ids
    ChromaDB cosine distance: 0 = identical, 2 = opposite.
    We convert to a similarity score: 1 - (distance / 2)
    """
    col = get_collection()
    results = col.query(query_texts=[query_text], n_results=top_k)
    return {
        "documents": results["documents"][0] if results["documents"] else [],
        "metadatas": results["metadatas"][0] if results["metadatas"] else [],
        "distances": results["distances"][0] if results["distances"] else [],
        "ids": results["ids"][0] if results["ids"] else [],
    }


def distance_to_similarity(distance: float) -> float:
    """Convert ChromaDB cosine distance (0-2) to similarity score (0-1)."""
    return 1.0 - (distance / 2.0)


# ── PDF ingestion for knowledge base ─────────────────────────────────────────

CHUNK_SIZE = 1000  # characters per chunk
CHUNK_OVERLAP = 200


def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c.strip() for c in chunks if c.strip()]


def load_curated_pdfs(knowledge_base_dir: str | Path) -> int:
    """
    Read every PDF in *knowledge_base_dir*, extract text via pdfplumber,
    chunk it, and upsert into Chroma with source='curated' metadata.

    Returns the number of chunks ingested.
    """
    try:
        import pdfplumber
    except ImportError:
        logger.warning("pdfplumber not installed — skipping PDF ingestion")
        return 0

    kb_path = Path(knowledge_base_dir)
    if not kb_path.exists():
        logger.info("Knowledge base dir %s does not exist — skipping", kb_path)
        return 0

    pdf_files = list(kb_path.glob("*.pdf"))
    if not pdf_files:
        logger.info("No PDFs found in %s", kb_path)
        return 0

    all_docs: list[str] = []
    all_metas: list[dict[str, Any]] = []
    all_ids: list[str] = []

    for pdf_file in pdf_files:
        logger.info("Ingesting %s", pdf_file.name)
        try:
            with pdfplumber.open(pdf_file) as pdf:
                full_text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        except Exception as exc:
            logger.error("Failed to read %s: %s", pdf_file.name, exc)
            continue

        if not full_text.strip():
            continue

        chunks = _chunk_text(full_text)
        for i, chunk in enumerate(chunks):
            doc_id = hashlib.sha256(f"{pdf_file.name}:{i}".encode()).hexdigest()[:16]
            all_docs.append(chunk)
            all_metas.append({
                "source": "curated",
                "filename": pdf_file.name,
                "chunk_index": i,
            })
            all_ids.append(doc_id)

    if all_docs:
        upsert_documents(all_docs, all_metas, all_ids)
        logger.info("Loaded %d chunks from %d PDFs", len(all_docs), len(pdf_files))

    return len(all_docs)
