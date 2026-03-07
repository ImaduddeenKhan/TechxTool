"""
Exa AI integration — async search with retries and rate-limit handling.

Uses the official exa-py SDK (AsyncExa) with EXA_API_KEY.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any

from app.config import EXA_API_KEY

logger = logging.getLogger(__name__)

# ── Result type ───────────────────────────────────────────────────────────────


@dataclass
class ExaSearchResult:
    """Sanitised search result from Exa AI."""

    title: str
    snippet: str
    url: str


# ── Client helper ─────────────────────────────────────────────────────────────

MAX_RETRIES = 3
BACKOFF_BASE = 1.5  # seconds


async def search(
    query: str,
    num_results: int = 10,
    *,
    search_type: str = "auto",
) -> list[ExaSearchResult]:
    """
    Search Exa AI for *query* and return sanitised results.

    Retries up to MAX_RETRIES with exponential backoff on transient errors.
    """
    try:
        from exa_py import AsyncExa  # type: ignore[import-untyped]
    except ImportError:
        logger.error("exa-py not installed — returning empty results")
        return []

    exa = AsyncExa(api_key=EXA_API_KEY)

    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = await exa.search(
                query,
                type=search_type,
                num_results=num_results,
                contents={"text": True},
            )
            return _sanitise(response)
        except Exception as exc:
            last_exc = exc
            # Simple rate-limit / transient error detection
            exc_str = str(exc).lower()
            if "429" in exc_str or "rate" in exc_str or "timeout" in exc_str:
                wait = BACKOFF_BASE ** attempt
                logger.warning(
                    "Exa search attempt %d/%d hit rate limit — retrying in %.1fs",
                    attempt,
                    MAX_RETRIES,
                    wait,
                )
                await asyncio.sleep(wait)
            else:
                logger.error("Exa search failed (attempt %d): %s", attempt, exc)
                break  # non-transient error

    logger.error("Exa search exhausted retries. Last error: %s", last_exc)
    return []


# ── Sanitisation ──────────────────────────────────────────────────────────────


def _sanitise(response: Any) -> list[ExaSearchResult]:
    """Extract (title, snippet, url) from the SDK response."""
    results: list[ExaSearchResult] = []
    for item in getattr(response, "results", []):
        title = getattr(item, "title", "") or ""
        text = getattr(item, "text", "") or ""
        url = getattr(item, "url", "") or ""
        snippet = text[:500] if text else ""
        results.append(ExaSearchResult(title=title.strip(), snippet=snippet.strip(), url=url.strip()))
    return results
