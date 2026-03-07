"""
Supabase client — wraps supabase-py for project & metadata persistence.

Requires env vars: SUPABASE_URL, SUPABASE_KEY
Optional: SUPABASE_STORAGE (bucket name for PDF uploads)
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from supabase import Client, create_client

from app.config import SUPABASE_KEY, SUPABASE_STORAGE, SUPABASE_URL

logger = logging.getLogger(__name__)

# ── Singleton client ──────────────────────────────────────────────────────────

_client: Client | None = None


def get_client() -> Client:
    """Return (and lazily create) the Supabase client."""
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialised")
    return _client


# ── Projects table helpers ────────────────────────────────────────────────────
# Expected table: "projects" with columns:
#   id (uuid, PK), user_input (jsonb), parsed_requirements (jsonb),
#   discovery_result (jsonb), comparison_result (jsonb),
#   pdf_url (text), created_at (timestamptz)


def save_project(data: dict[str, Any]) -> dict[str, Any]:
    """Insert or upsert a project row. Returns the saved record."""
    client = get_client()
    if "id" not in data:
        data["id"] = str(uuid.uuid4())
    if "created_at" not in data:
        data["created_at"] = datetime.now(timezone.utc).isoformat()

    # Serialise nested pydantic/dict objects to JSON-safe dicts
    for key in ("user_input", "parsed_requirements", "discovery_result", "comparison_result"):
        if key in data and hasattr(data[key], "model_dump"):
            data[key] = data[key].model_dump()

    result = client.table("projects").upsert(data).execute()
    logger.info("Saved project %s", data["id"])
    return result.data[0] if result.data else data


def get_project(project_id: str) -> dict[str, Any] | None:
    """Fetch a single project by ID."""
    client = get_client()
    result = client.table("projects").select("*").eq("id", project_id).execute()
    return result.data[0] if result.data else None


# ── Metadata table helpers ────────────────────────────────────────────────────
# Expected table: "metadata" with columns:
#   id (uuid, PK), project_id (uuid, FK), raw_results (jsonb), created_at


def save_metadata(project_id: str, raw_results: Any) -> dict[str, Any]:
    """Store raw Exa/discovery results linked to a project."""
    client = get_client()
    payload = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "raw_results": raw_results if isinstance(raw_results, (dict, list)) else json.loads(json.dumps(raw_results, default=str)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("metadata").upsert(payload).execute()
    logger.info("Saved metadata for project %s", project_id)
    return result.data[0] if result.data else payload


# ── Storage helpers ───────────────────────────────────────────────────────────


def upload_pdf(file_path: str, bucket: str | None = None) -> str | None:
    """Upload a PDF to Supabase Storage. Returns public URL or None."""
    bucket = bucket or SUPABASE_STORAGE
    if not bucket:
        logger.warning("SUPABASE_STORAGE not set — skipping cloud upload")
        return None

    client = get_client()
    import pathlib

    name = pathlib.Path(file_path).name
    with open(file_path, "rb") as f:
        client.storage.from_(bucket).upload(name, f, {"content-type": "application/pdf"})

    url = client.storage.from_(bucket).get_public_url(name)
    logger.info("Uploaded %s → %s", name, url)
    return url
