"""Pydantic v2 models for the Tech-Stack Recommender API."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ── User Input ────────────────────────────────────────────────────────────────

class UserInput(BaseModel):
    """Raw form data submitted by the user."""

    project_type: str = Field(
        ...,
        description=(
            "E.g. 'E-commerce Platform', 'Ride-sharing (Uber-style)', "
            "or a custom idea prefixed with 'Custom: '"
        ),
        min_length=1,
        max_length=2000,
    )
    scale: Literal["small", "medium", "large", "enterprise"] = Field(
        "small", description="Expected scale of the project"
    )
    pricing_model: Literal["free", "freemium", "paid", "enterprise"] = Field(
        "free", description="Monetisation model"
    )
    preferred_language: str = Field(
        "", description="Primary programming language preference (e.g. 'Python', 'TypeScript')"
    )
    platform_type: list[str] = Field(
        default_factory=list,
        description="Target platforms: 'Web App', 'Mobile App', 'Data Pipeline', 'AI/ML'",
    )
    output_format: Literal["table", "table_explanation", "pdf"] = Field(
        "table", description="Desired output format"
    )
    pinned_techs: list[str] = Field(
        default_factory=list,
        description="Technologies the user wants to keep (e.g. ['React', 'PostgreSQL'])",
    )
    notes: str | None = Field(
        None, description="Free-form notes or constraints"
    )


# ── Parsed Requirements ──────────────────────────────────────────────────────

class ParsedRequirements(BaseModel):
    """Normalised requirements + generated search queries."""

    project_type: str
    scale: str
    pricing_model: str
    preferred_language: str
    platform_type: list[str]
    pinned_techs: list[str]
    notes: str | None = None
    search_queries: list[str] = Field(
        ..., min_length=4, max_length=6, description="4-6 search strings for Exa AI"
    )


# ── Discovery ────────────────────────────────────────────────────────────────

class DiscoveryCandidate(BaseModel):
    """A single technology candidate returned by discovery."""

    name: str
    category: str = Field(..., description="E.g. 'frontend', 'backend', 'db'")
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    url: str = ""
    snippet: str = ""
    source: Literal["curated", "realtime"] = "realtime"
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)


class DiscoveryResult(BaseModel):
    """Aggregated discovery results grouped by category."""

    candidates: dict[str, list[DiscoveryCandidate]] = Field(
        default_factory=dict,
        description="Keys are categories like 'frontend', 'backend', etc.",
    )
    retrieval_source: Literal["curated", "realtime", "hybrid"] = "realtime"
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)


# ── Comparison / Generation ──────────────────────────────────────────────────

class ComponentOption(BaseModel):
    """One option within a stack component."""

    name: str
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    complexity: Literal["low", "medium", "high"] = "medium"
    monthly_estimate_range: str = Field("$0", description="E.g. '$0', '$5-$20'")
    license: str = "MIT"


class ComparisonComponent(BaseModel):
    """A stack component with its option set."""

    name: str
    options: list[ComponentOption] = Field(default_factory=list)


class ComparisonResult(BaseModel):
    """Full comparison table returned by /api/generate."""

    components: dict[str, ComparisonComponent] = Field(
        default_factory=dict,
        description="Keys: frontend, backend, db, auth, vector_store, hosting, pdf, queue",
    )
    best_mvp: str = ""
    best_scale: str = ""
    best_budget: str = ""
    explanations: dict[str, str] = Field(
        default_factory=dict,
        description="Category → detailed explanation paragraph",
    )


# ── Project Record ───────────────────────────────────────────────────────────

class ProjectRecord(BaseModel):
    """Persisted project with all artefacts."""

    id: str
    user_input: UserInput | None = None
    parsed_requirements: ParsedRequirements | None = None
    discovery_result: DiscoveryResult | None = None
    comparison_result: ComparisonResult | None = None
    pdf_url: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── Export Request ───────────────────────────────────────────────────────────

class ExportPDFRequest(BaseModel):
    """Payload for the PDF export endpoint."""

    result: ComparisonResult
    project_id: str | None = None
