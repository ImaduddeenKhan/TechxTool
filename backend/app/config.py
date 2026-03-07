"""
Application configuration — loads all env vars at import time.

Required:  EXA_API_KEY, SUPABASE_URL, SUPABASE_KEY
Optional:  GEMINI_API_KEY, CHROMA_DIR, STORAGE_PATH, SUPABASE_STORAGE,
           FASTAPI_PORT, CHROMA_SIMILARITY_THRESHOLD
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (backend/../.env) or backend/.env
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)
else:
    load_dotenv()  # fall back to cwd

# ── helpers ───────────────────────────────────────────────────────────────────

def _require(name: str) -> str:
    """Return env var value or raise with a helpful message."""
    val = os.environ.get(name)
    if not val:
        raise ValueError(
            f"Missing required environment variable: {name}. "
            f"Copy .env.example → .env and fill in the value."
        )
    return val


# ── Required keys ─────────────────────────────────────────────────────────────

EXA_API_KEY: str = _require("EXA_API_KEY")
SUPABASE_URL: str = _require("SUPABASE_URL")
SUPABASE_KEY: str = _require("SUPABASE_KEY")

# ── Optional keys ─────────────────────────────────────────────────────────────

# TODO: Plug in Gemini or another LLM provider using this key
GEMINI_API_KEY: str | None = os.environ.get("GEMINI_API_KEY") or None

CHROMA_DIR: str = os.environ.get("CHROMA_DIR", "./chroma_db")
STORAGE_PATH: str = os.environ.get("STORAGE_PATH", "./storage")
SUPABASE_STORAGE: str | None = os.environ.get("SUPABASE_STORAGE") or None
FASTAPI_PORT: int = int(os.environ.get("FASTAPI_PORT", "8000"))

# Hybrid retrieval: similarity threshold (0.0 – 1.0)
CHROMA_SIMILARITY_THRESHOLD: float = float(
    os.environ.get("CHROMA_SIMILARITY_THRESHOLD", "0.75")
)
