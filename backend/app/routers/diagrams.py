"""Router for diagram generation."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.diagram_generator import generate_diagrams

logger = logging.getLogger(__name__)
router = APIRouter()


class DiagramRequest(BaseModel):
    requirements: dict
    tech_stack: dict


class DiagramResponse(BaseModel):
    er_diagram: str | None = None
    flow_diagram: str | None = None
    architecture_diagram: str | None = None


@router.post("/generate-diagrams", response_model=DiagramResponse)
async def api_generate_diagrams(request: DiagramRequest):
    """Generate Mermaid diagrams based on requirements and tech stack."""
    try:
        result = generate_diagrams(request.requirements, request.tech_stack)
        return DiagramResponse(**result)
    except Exception as exc:
        logger.error("Diagram generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
