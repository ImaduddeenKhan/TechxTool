"""
GET /api/project/{id} — fetch a saved project from Supabase.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ProjectRecord
from app.services import supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/project/{project_id}", response_model=ProjectRecord)
async def get_project(project_id: str) -> ProjectRecord:
    """
    Fetch a saved project by ID, including results and PDF download link.
    """
    logger.info("Fetching project %s", project_id)
    data = supabase_client.get_project(project_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return ProjectRecord(**data)
