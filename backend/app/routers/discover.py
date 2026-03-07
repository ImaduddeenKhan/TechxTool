"""
POST /api/discover — hybrid retrieval: curated ChromaDB first, Exa AI fallback.
"""

from __future__ import annotations

import asyncio
import logging
import uuid

from fastapi import APIRouter

from app.config import CHROMA_SIMILARITY_THRESHOLD
from app.models.schemas import DiscoveryCandidate, DiscoveryResult, ParsedRequirements
from app.services import chroma_client, exa_client, supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Categories we try to fill
CATEGORIES = ["frontend", "backend", "db", "auth", "vector_store", "hosting", "pdf", "queue"]

# ── Complexity heuristics ─────────────────────────────────────────────────────

COMPLEX_KEYWORDS = {"custom", "distributed", "real-time", "realtime", "microservice", "kubernetes", "ml pipeline"}


def _is_complex(req: ParsedRequirements) -> bool:
    """Return True if the project looks too complex for curated answers."""
    if req.scale == "enterprise":
        return True
    if any("AI" in p or "ML" in p for p in req.platform_type):
        return True
    if len(req.pinned_techs) > 3:
        return True
    if req.notes:
        lower_notes = req.notes.lower()
        if any(kw in lower_notes for kw in COMPLEX_KEYWORDS):
            return True
    return False


# ── Endpoint ──────────────────────────────────────────────────────────────────


@router.post("/discover", response_model=DiscoveryResult)
async def discover(requirements: ParsedRequirements) -> DiscoveryResult:
    """
    Hybrid retrieval pipeline:

    1. Query ChromaDB (curated + cached realtime) for each search query.
    2. If average similarity is above threshold AND project is not complex,
       return curated results directly (fast, free).
    3. Otherwise call Exa AI for realtime discovery, store results back
       into ChromaDB and Supabase for future re-use.
    """
    queries = requirements.search_queries
    logger.info("Discover: %d queries, scale=%s", len(queries), requirements.scale)

    # ── Step 1: probe Chroma ──────────────────────────────────────────────
    chroma_hits: list[dict] = []
    total_similarity = 0.0
    hit_count = 0

    for q in queries:
        res = chroma_client.query(q, top_k=5)
        for doc, meta, dist in zip(res["documents"], res["metadatas"], res["distances"]):
            sim = chroma_client.distance_to_similarity(dist)
            total_similarity += sim
            hit_count += 1
            chroma_hits.append({"doc": doc, "meta": meta, "similarity": sim})

    avg_similarity = total_similarity / hit_count if hit_count else 0.0
    project_complex = _is_complex(requirements)

    logger.info(
        "Chroma probe: %d hits, avg_sim=%.3f, complex=%s, threshold=%.2f",
        hit_count, avg_similarity, project_complex, CHROMA_SIMILARITY_THRESHOLD,
    )

    # ── Step 2: decide retrieval path ─────────────────────────────────────
    if avg_similarity >= CHROMA_SIMILARITY_THRESHOLD and not project_complex:
        # Fast path: return curated results
        candidates = _build_candidates_from_chroma(chroma_hits)
        return DiscoveryResult(
            candidates=candidates,
            retrieval_source="curated",
            confidence_score=round(avg_similarity, 3),
        )

    # ── Step 3: Exa AI realtime discovery ─────────────────────────────────
    logger.info("Falling back to Exa AI for realtime discovery")
    exa_results = await asyncio.gather(
        *[exa_client.search(q, num_results=5) for q in queries],
        return_exceptions=True,
    )

    # Flatten and store
    all_docs: list[str] = []
    all_metas: list[dict] = []
    all_ids: list[str] = []
    raw_for_supabase: list[dict] = []

    for query_text, res in zip(queries, exa_results):
        if isinstance(res, Exception):
            logger.error("Exa query failed for '%s': %s", query_text, res)
            continue
        for item in res:
            doc_text = f"{item.title}\n{item.snippet}"
            doc_id = uuid.uuid4().hex[:16]
            all_docs.append(doc_text)
            all_metas.append({"source": "realtime", "url": item.url, "title": item.title})
            all_ids.append(doc_id)
            raw_for_supabase.append({
                "title": item.title,
                "snippet": item.snippet,
                "url": item.url,
                "query": query_text,
            })

    # Persist to Chroma for future queries
    if all_docs:
        chroma_client.upsert_documents(all_docs, all_metas, all_ids)

    # Persist raw results to Supabase metadata table
    try:
        project_id = uuid.uuid4().hex
        supabase_client.save_metadata(project_id, raw_for_supabase)
    except Exception as exc:
        logger.error("Failed to save metadata to Supabase: %s", exc)

    # Combine chroma curated hits (if any) + new Exa results
    candidates = _build_candidates_from_exa(raw_for_supabase)
    combined_similarity = avg_similarity * 0.3 + 0.7  # boost because we got fresh data

    source = "hybrid" if chroma_hits and raw_for_supabase else "realtime"

    return DiscoveryResult(
        candidates=candidates,
        retrieval_source=source,
        confidence_score=round(min(combined_similarity, 1.0), 3),
    )


# ── Helpers ───────────────────────────────────────────────────────────────────


def _build_candidates_from_chroma(hits: list[dict]) -> dict[str, list[DiscoveryCandidate]]:
    """Group chroma hits into category buckets (best-effort categorisation)."""
    cats: dict[str, list[DiscoveryCandidate]] = {c: [] for c in CATEGORIES}

    for hit in sorted(hits, key=lambda h: h["similarity"], reverse=True):
        doc = hit["doc"]
        meta = hit["meta"]
        sim = hit["similarity"]
        category = _guess_category(doc)
        candidate = DiscoveryCandidate(
            name=meta.get("filename", meta.get("title", "Unknown")),
            category=category,
            snippet=doc[:300],
            source="curated",
            confidence_score=round(sim, 3),
        )
        if len(cats[category]) < 5:
            cats[category].append(candidate)

    return {k: v for k, v in cats.items() if v}


def _build_candidates_from_exa(raw: list[dict]) -> dict[str, list[DiscoveryCandidate]]:
    """Convert raw Exa search results into categorised candidates."""
    cats: dict[str, list[DiscoveryCandidate]] = {c: [] for c in CATEGORIES}

    for item in raw:
        category = _guess_category(f"{item['title']} {item['snippet']}")
        candidate = DiscoveryCandidate(
            name=item["title"],
            category=category,
            url=item["url"],
            snippet=item["snippet"][:300],
            source="realtime",
            confidence_score=0.7,
        )
        if len(cats[category]) < 5:
            cats[category].append(candidate)

    return {k: v for k, v in cats.items() if v}


def _guess_category(text: str) -> str:
    """Naive keyword-based category assignment."""
    lower = text.lower()
    mapping = {
        "frontend": ["react", "vue", "angular", "svelte", "next.js", "nuxt", "frontend", "tailwind", "css"],
        "backend": ["fastapi", "express", "django", "flask", "nest", "spring", "backend", "server"],
        "db": ["postgres", "mysql", "mongo", "database", "supabase", "firebase", "dynamo", "redis"],
        "auth": ["auth", "oauth", "jwt", "clerk", "passport", "identity"],
        "vector_store": ["vector", "embedding", "chroma", "pinecone", "weaviate", "qdrant"],
        "hosting": ["deploy", "hosting", "render", "vercel", "aws", "docker", "kubernetes"],
        "pdf": ["pdf", "report", "export", "weasyprint", "reportlab"],
        "queue": ["queue", "celery", "worker", "background", "cron", "job"],
    }
    for cat, keywords in mapping.items():
        if any(kw in lower for kw in keywords):
            return cat
    return "backend"  # default bucket
