"""
POST /api/export-pdf — generate PDF from comparison result, return as download.
"""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.config import STORAGE_PATH
from app.models.schemas import ExportPDFRequest
from app.services import supabase_client
from app.services.pdf_generator import generate_pdf

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/export-pdf")
async def export_pdf(payload: ExportPDFRequest) -> FileResponse:
    """
    Generate a PDF report from the comparison result.

    - Saves to local storage/ directory
    - Optionally uploads to Supabase Storage (if SUPABASE_STORAGE is set)
    - Returns the PDF as a streaming file download

    If a project_id is provided, updates the project record with the PDF URL.
    """
    logger.info("Exporting PDF (project_id=%s)", payload.project_id)

    # Generate the PDF
    filepath = generate_pdf(payload.result, output_dir=STORAGE_PATH)
    filename = Path(filepath).name

    # Upload to Supabase Storage if configured
    pdf_url: str | None = None
    try:
        pdf_url = supabase_client.upload_pdf(filepath)
    except Exception as exc:
        logger.warning("Supabase upload failed (non-fatal): %s", exc)

    # Update project record if we have an ID
    if payload.project_id and pdf_url:
        try:
            supabase_client.save_project({
                "id": payload.project_id,
                "pdf_url": pdf_url,
            })
        except Exception as exc:
            logger.warning("Failed to update project with PDF URL: %s", exc)

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/pdf",
    )
