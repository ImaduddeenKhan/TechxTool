"""
FastAPI application entry point — Tech-Stack Recommender.

Startup: loads .env, validates config, initialises Supabase + Chroma,
ingests curated PDFs from knowledge_base/, creates storage dir.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Async startup / shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────────────────────────
    logger.info("Starting Tech-Stack Recommender API …")

    # 1. Validate config (will raise if required env vars are missing)
    from app.config import CHROMA_DIR, STORAGE_PATH  # noqa: F811

    # 2. Ensure storage directory
    Path(STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    logger.info("Storage directory: %s", Path(STORAGE_PATH).resolve())

    # 3. Initialise ChromaDB collection
    from app.services.chroma_client import get_collection, load_curated_pdfs

    get_collection()

    # 4. Ingest curated PDFs
    kb_dir = Path(__file__).resolve().parent.parent / "knowledge_base"
    n = load_curated_pdfs(kb_dir)
    logger.info("Loaded %d curated PDF chunks into Chroma", n)

    # 5. Quick Supabase ping
    try:
        from app.services.supabase_client import get_client
        get_client()
        logger.info("Supabase client OK")
    except Exception as exc:
        logger.error("Supabase init failed: %s", exc)

    logger.info("Startup complete ✓")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────
    logger.info("Shutting down Tech-Stack Recommender API …")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Tech-Stack Recommender",
    description="AI-powered tech-stack comparison and recommendation engine",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

from app.routers import discover, export, generate, parse, project  # noqa: E402

app.include_router(parse.router, prefix="/api", tags=["parse"])
app.include_router(discover.router, prefix="/api", tags=["discover"])
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(project.router, prefix="/api", tags=["project"])
app.include_router(export.router, prefix="/api", tags=["export"])


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health():
    """Simple liveness check."""
    return {"status": "ok", "service": "tech-stack-recommender"}
