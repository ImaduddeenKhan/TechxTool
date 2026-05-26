"""Router for prompt generation."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.prompt_generator import generate_prompts

logger = logging.getLogger(__name__)
router = APIRouter()


class PromptRequest(BaseModel):
    requirements: dict
    tech_stack: dict
    diagrams: dict | None = None


class PromptResponse(BaseModel):
    phases: list[dict]


@router.post("/generate-prompts", response_model=PromptResponse)
async def api_generate_prompts(request: PromptRequest):
    """Generate phased development prompts based on requirements, tech stack, and diagrams."""
    try:
        result = generate_prompts(request.requirements, request.tech_stack, request.diagrams)
        return PromptResponse(**result)
    except Exception as exc:
        logger.error("Prompt generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
