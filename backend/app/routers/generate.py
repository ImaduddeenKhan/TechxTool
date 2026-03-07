"""
POST /api/generate — produce a structured comparison table.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.models.schemas import ComparisonResult, DiscoveryResult, ParsedRequirements
from app.services.llm_orchestrator import generate_comparison

router = APIRouter()
logger = logging.getLogger(__name__)


class GenerateRequest(ParsedRequirements):
    """Extends ParsedRequirements with discovery data."""

    discovery: DiscoveryResult


@router.post("/generate", response_model=ComparisonResult)
async def generate(payload: GenerateRequest) -> ComparisonResult:
    """
    Takes parsed requirements + discovery results and produces a
    structured comparison table via the LLM orchestrator.

    Currently uses a deterministic fallback; plug in Gemini via GEMINI_API_KEY.
    """
    logger.info("Generating comparison for project_type=%s", payload.project_type)

    # Build the ParsedRequirements portion
    requirements = ParsedRequirements(
        project_type=payload.project_type,
        scale=payload.scale,
        pricing_model=payload.pricing_model,
        preferred_language=payload.preferred_language,
        platform_type=payload.platform_type,
        pinned_techs=payload.pinned_techs,
        notes=payload.notes,
        search_queries=payload.search_queries,
    )

    result = generate_comparison(requirements, payload.discovery)
    return result
