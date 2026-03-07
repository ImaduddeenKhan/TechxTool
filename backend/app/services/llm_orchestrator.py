"""
LLM orchestration — builds a structured comparison from requirements + discovery.

Currently uses a deterministic prompt-template approach (no LLM call).
Includes a placeholder for Gemini or other LLM provider via GEMINI_API_KEY.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from app.config import GEMINI_API_KEY
from app.models.schemas import (
    ComparisonComponent,
    ComparisonResult,
    ComponentOption,
    DiscoveryResult,
    ParsedRequirements,
)

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "prompts"


def _load_prompt(filename: str) -> str:
    """Load a prompt template from the prompts/ folder."""
    path = PROMPTS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    logger.warning("Prompt file %s not found — using inline fallback", path)
    return ""


def _fill_template(template: str, variables: dict[str, Any]) -> str:
    """Simple {{var}} replacement in the template."""
    result = template
    for key, val in variables.items():
        result = result.replace(f"{{{{{key}}}}}", str(val))
    return result


# ── Main entry point ──────────────────────────────────────────────────────────


def generate_comparison(
    requirements: ParsedRequirements,
    discovery: DiscoveryResult,
) -> ComparisonResult:
    """
    Produce a structured comparison table.

    If GEMINI_API_KEY is set, delegates to _call_gemini().
    Otherwise falls back to a deterministic builder.
    """
    if GEMINI_API_KEY:
        return _call_gemini(requirements, discovery)
    return _deterministic_comparison(requirements, discovery)


# ── Gemini placeholder ────────────────────────────────────────────────────────


def _call_gemini(
    requirements: ParsedRequirements,
    discovery: DiscoveryResult,
) -> ComparisonResult:
    """
    TODO: Implement actual Gemini API call.

    Steps to integrate:
      1. pip install google-generativeai
      2. import google.generativeai as genai
      3. genai.configure(api_key=GEMINI_API_KEY)
      4. model = genai.GenerativeModel("gemini-pro")
      5. Load prompts/generate_prompt.txt, fill variables, call model.generate_content()
      6. Parse JSON response into ComparisonResult
    """
    logger.info("Gemini integration placeholder — falling back to deterministic")
    template = _load_prompt("generate_prompt.txt")
    variables = {
        "project_type": requirements.project_type,
        "scale": requirements.scale,
        "pricing_model": requirements.pricing_model,
        "language": requirements.preferred_language,
        "platforms": ", ".join(requirements.platform_type),
        "pinned_techs": ", ".join(requirements.pinned_techs),
        "notes": requirements.notes or "None",
        "candidates_json": json.dumps(
            {k: [c.model_dump() for c in v] for k, v in discovery.candidates.items()},
            indent=2,
        ),
    }
    filled_prompt = _fill_template(template, variables)
    logger.debug("Gemini prompt (%d chars): %s…", len(filled_prompt), filled_prompt[:200])

    # TODO: Replace this with actual Gemini call and JSON parse
    return _deterministic_comparison(requirements, discovery)


# ── Deterministic fallback ────────────────────────────────────────────────────


def _deterministic_comparison(
    req: ParsedRequirements,
    disc: DiscoveryResult,
) -> ComparisonResult:
    """Build a reasonable comparison table without an LLM."""

    def _opt(name: str, pros: list[str], cons: list[str], complexity: str = "medium",
             cost: str = "$0", lic: str = "MIT") -> ComponentOption:
        return ComponentOption(
            name=name, pros=pros, cons=cons,
            complexity=complexity, monthly_estimate_range=cost, license=lic,
        )

    # Defaults keyed by scale
    is_large = req.scale in ("large", "enterprise")

    components: dict[str, ComparisonComponent] = {
        "frontend": ComparisonComponent(name="Frontend", options=[
            _opt("React + Vite", ["Huge ecosystem", "Fast HMR"], ["JSX learning curve"], "low", "$0"),
            _opt("Next.js", ["SSR/SSG", "File-based routing"], ["Opinionated"], "medium", "$0-$20"),
            _opt("Vue 3 + Nuxt", ["Gentle curve", "Good DX"], ["Smaller ecosystem"], "low", "$0"),
        ]),
        "backend": ComparisonComponent(name="Backend", options=[
            _opt("FastAPI (Python)", ["Async", "Auto docs", "Type hints"], ["Python GIL"], "low", "$0"),
            _opt("Express (Node)", ["Massive ecosystem"], ["Callback patterns"], "low", "$0"),
            _opt("Django", ["Batteries-included", "Admin"], ["Monolithic"], "medium", "$0"),
        ]),
        "db": ComparisonComponent(name="Database", options=[
            _opt("PostgreSQL (Supabase)", ["Relational", "Free tier", "Realtime"], ["Self-hosting complexity"], "low", "$0-$25"),
            _opt("MongoDB Atlas", ["Flexible schema", "Free tier"], ["No joins"], "low", "$0-$57"),
            _opt("PlanetScale (MySQL)", ["Branching", "Serverless"], ["MySQL quirks"], "medium", "$0-$29", "Proprietary"),
        ]),
        "auth": ComparisonComponent(name="Auth", options=[
            _opt("Supabase Auth", ["Built-in", "Social providers"], ["Vendor lock-in"], "low", "$0"),
            _opt("Clerk", ["Great DX", "Drop-in UI"], ["Paid above free tier"], "low", "$0-$25", "Proprietary"),
            _opt("NextAuth / Auth.js", ["OSS", "Flexible"], ["Config heavy"], "medium", "$0"),
        ]),
        "vector_store": ComparisonComponent(name="Vector Store", options=[
            _opt("ChromaDB (local)", ["Simple", "No infra"], ["Single-node"], "low", "$0", "Apache-2.0"),
            _opt("Pinecone", ["Managed", "Scalable"], ["Cost at scale"], "low", "$0-$70", "Proprietary"),
            _opt("Weaviate", ["Hybrid search", "OSS"], ["Resource hungry"], "medium", "$0"),
        ]),
        "hosting": ComparisonComponent(name="Hosting", options=[
            _opt("Render", ["Free tier", "Easy deploy"], ["Cold starts"], "low", "$0-$7"),
            _opt("Vercel + Railway", ["Frontend CDN", "Backend PaaS"], ["Two services"], "low", "$0-$10"),
            _opt("AWS (ECS/Lambda)", ["Full control", "Scale"], ["Complex setup"], "high", "$5-$100+"),
        ]),
        "pdf": ComparisonComponent(name="PDF Generation", options=[
            _opt("WeasyPrint", ["HTML/CSS → PDF", "High fidelity"], ["System deps"], "medium", "$0"),
            _opt("ReportLab", ["Pure Python", "Fine control"], ["Low-level API"], "medium", "$0", "BSD"),
        ]),
        "queue": ComparisonComponent(name="Task Queue", options=[
            _opt("None (sync)", ["Simple"], ["Blocks on long tasks"], "low", "$0"),
            _opt("Celery + Redis", ["Battle-tested"], ["Infra overhead"], "high", "$0-$15"),
            _opt("ARQ (async)", ["Lightweight", "AsyncIO native"], ["Less ecosystem"], "medium", "$0"),
        ]),
    }

    # Pick best labels
    best_mvp = "React + Vite | FastAPI | Supabase (Postgres + Auth) | ChromaDB | Render"
    best_scale = "Next.js | FastAPI | PostgreSQL | Pinecone | AWS ECS"
    best_budget = "React + Vite | FastAPI | Supabase (free) | ChromaDB | Render free tier"

    if is_large:
        best_mvp = best_scale  # for large projects, MVP ≈ scale pick

    explanations = {
        "frontend": "React + Vite offers the fastest development iteration with hot module replacement and a massive component ecosystem.",
        "backend": "FastAPI provides async-first Python with automatic OpenAPI docs, ideal for AI-heavy workloads.",
        "db": "Supabase wraps PostgreSQL with a generous free tier, built-in auth, and realtime subscriptions.",
        "auth": "Supabase Auth is the simplest choice when already using Supabase for the database.",
        "vector_store": "ChromaDB is perfect for local development and small-to-medium knowledge bases.",
        "hosting": "Render's free tier covers hobby projects; upgrade to paid for production traffic.",
        "pdf": "WeasyPrint converts HTML/CSS to PDF with high fidelity; ReportLab is the pure-Python fallback.",
        "queue": "Start without a queue; add ARQ or Celery when background tasks become bottlenecks.",
    }

    return ComparisonResult(
        components=components,
        best_mvp=best_mvp,
        best_scale=best_scale,
        best_budget=best_budget,
        explanations=explanations,
    )
