"""
Discovery worker — deeper async discovery (stub).

Can be invoked standalone:
    python -m workers.discovery_worker <project_id>

Or imported and called:
    await run_deep_discovery("project-uuid")
"""

from __future__ import annotations

import asyncio
import logging
import sys

logger = logging.getLogger(__name__)


async def run_deep_discovery(project_id: str) -> None:
    """
    Run deeper, slower discovery for a project.

    This is a placeholder that can be extended with:
    - Additional Exa AI queries with different search types
    - Web scraping via Playwright (see commented section below)
    - GitHub API calls for repo stats
    - npm/PyPI metadata fetching
    """
    logger.info("Starting deep discovery for project %s", project_id)

    # TODO: Fetch project from Supabase
    # from app.services.supabase_client import get_project
    # project = get_project(project_id)

    # TODO: Run additional Exa queries with type="deep"
    # from app.services.exa_client import search
    # results = await search("...", search_type="deep")

    # ── Playwright scraping stub (uncomment when needed) ──────────────────
    #
    # async def scrape_page(url: str) -> str:
    #     """Scrape a page using Playwright (requires: pip install playwright)."""
    #     from playwright.async_api import async_playwright
    #     async with async_playwright() as p:
    #         browser = await p.chromium.launch(headless=True)
    #         page = await browser.new_page()
    #         await page.goto(url, wait_until="networkidle")
    #         content = await page.content()
    #         await browser.close()
    #         return content
    #
    # urls_to_scrape = []
    # for url in urls_to_scrape:
    #     html = await scrape_page(url)
    #     # parse and store results...
    #

    # TODO: Save enriched results back to Supabase
    # from app.services.supabase_client import save_project
    # save_project({"id": project_id, "deep_discovery": enriched})

    logger.info("Deep discovery complete for project %s", project_id)


# ── CLI entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m workers.discovery_worker <project_id>")
        sys.exit(1)

    project_id = sys.argv[1]
    asyncio.run(run_deep_discovery(project_id))
