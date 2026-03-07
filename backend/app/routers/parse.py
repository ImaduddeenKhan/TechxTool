"""
POST /api/parse — validate user input, normalise, generate search queries.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ParsedRequirements, UserInput

router = APIRouter()
logger = logging.getLogger(__name__)


def _normalise(inp: UserInput) -> dict:
    """Lowercase / dedupe / clean raw user input."""
    project_type_raw = inp.project_type.strip()

    # Detect custom idea: frontend sends "Custom: <user's description>"
    is_custom = project_type_raw.startswith("Custom:")
    if is_custom:
        custom_text = project_type_raw[len("Custom:"):].strip()
        # Enforce 200-word server-side limit
        words = custom_text.split()
        if len(words) > 200:
            custom_text = " ".join(words[:200])
        project_type = f"Custom: {custom_text}"
    else:
        project_type = project_type_raw

    return {
        "project_type": project_type,
        "is_custom_idea": is_custom,
        "scale": inp.scale,
        "pricing_model": inp.pricing_model,
        "preferred_language": inp.preferred_language.strip().lower() if inp.preferred_language else "",
        "platform_type": list(dict.fromkeys(p.strip() for p in inp.platform_type if p.strip())),
        "pinned_techs": list(dict.fromkeys(t.strip() for t in inp.pinned_techs if t.strip())),
        "notes": (inp.notes or "").strip() or None,
    }


def _generate_queries(norm: dict) -> list[str]:
    """
    Build 4-6 targeted search queries for Exa AI based on project attributes.

    Supports both predefined project types and custom user ideas.
    """
    pt = norm["project_type"]
    scale = norm["scale"]
    lang = norm["preferred_language"]
    platforms = norm["platform_type"]
    is_custom = norm.get("is_custom_idea", False)

    queries: list[str] = []

    if is_custom:
        # Extract the custom description (strip "Custom: " prefix)
        description = pt[len("Custom:"):].strip()
        # Use first ~30 words as a concise summary for search queries
        summary_words = description.split()[:30]
        summary = " ".join(summary_words)

        # 1 – Core stack query based on the idea
        queries.append(f"best tech stack for building {summary} {scale} scale 2025")

        # 2 – Architecture patterns
        queries.append(f"software architecture and frameworks for {summary}")

        # 3 – Language-specific
        if lang:
            queries.append(f"recommended {lang} tools and frameworks for {summary}")
        else:
            queries.append(f"top backend and frontend frameworks for {summary}")

        # 4 – Platform-specific
        if platforms:
            plat_str = " and ".join(platforms[:2])
            queries.append(f"{plat_str} technology stack for {summary}")

        # 5 – Infrastructure
        pricing = norm["pricing_model"]
        queries.append(f"infrastructure and hosting for {summary} {pricing} model")

        # 6 – Database & integrations
        queries.append(f"best database and integrations for {summary}")
    else:
        # 1 – Core stack query
        queries.append(f"best tech stack for {pt} {scale} scale 2025")

        # 2 – Language-specific
        if lang:
            queries.append(f"recommended {lang} frameworks for {pt} production")
        else:
            queries.append(f"top backend frameworks for {pt} project")

        # 3 – Platform-specific
        if platforms:
            plat_str = " and ".join(platforms[:2])
            queries.append(f"{plat_str} technology stack comparison {scale}")

        # 4 – Pricing / hosting
        pricing = norm["pricing_model"]
        queries.append(f"cheapest hosting and infrastructure for {pt} {pricing} model")

        # 5 – Database
        queries.append(f"best database for {pt} {scale} scale with auth and realtime")

        # 6 – Pinned tech integration (if any)
        pinned = norm["pinned_techs"]
        if pinned:
            pinned_str = ", ".join(pinned[:3])
            queries.append(f"how to integrate {pinned_str} for {pt}")

    # Ensure 4-6 queries
    return queries[:6] if len(queries) > 6 else queries


@router.post("/parse", response_model=ParsedRequirements)
async def parse_input(user_input: UserInput) -> ParsedRequirements:
    """
    Accept raw user input, validate, normalise, and return structured
    requirements together with 4-6 search queries for Exa AI.

    **Input**: UserInput JSON body
    **Output**: ParsedRequirements with `search_queries`
    """
    logger.info("Parsing input: project_type=%s scale=%s", user_input.project_type, user_input.scale)

    norm = _normalise(user_input)
    queries = _generate_queries(norm)

    if len(queries) < 4:
        raise HTTPException(status_code=422, detail="Could not generate enough search queries from input")

    return ParsedRequirements(
        project_type=norm["project_type"],
        scale=norm["scale"],
        pricing_model=norm["pricing_model"],
        preferred_language=norm["preferred_language"],
        platform_type=norm["platform_type"],
        pinned_techs=norm["pinned_techs"],
        notes=norm["notes"],
        search_queries=queries,
    )
