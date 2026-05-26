"""
Prompt generation service — creates phased development prompts.

Uses Gemini LLM to generate context-aware prompts based on project requirements,
tech stack, and diagrams. Falls back to deterministic templates.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

PROMPT_GENERATION_TEMPLATE = """You are a senior software architect and prompt engineer. Based on the following project details, generate 4 phased development prompts that a developer can copy and paste into an AI coding assistant (like Claude, Cursor, Bolt.new, etc.) to build the project step by step.

Project: {project_type}
Scale: {scale}
Preferred Language: {language}
Platforms: {platforms}
Pinned Technologies: {pinned_techs}
Notes: {notes}

Tech Stack Summary:
{tech_summary}

Instructions:
- Create exactly 4 phases.
- Each phase must be self-contained and buildable in sequence.
- Prompts must be highly detailed and actionable.
- Do NOT use emojis anywhere in the prompts.
- Each prompt should reference specific technologies from the tech stack.
- Include file structures, specific commands, and architecture decisions.
- The prompts should work with any AI coding assistant.

Return a JSON object with this exact structure (no markdown, no commentary):
{{
  "phases": [
    {{
      "title": "Phase 1: Project Setup & Foundation",
      "description": "Brief description of what this phase covers",
      "prompt": "The full prompt text that the user will copy and paste...",
      "platforms": ["Claude", "Cursor", "Bolt.new", "Lovable", "Replit"]
    }},
    {{
      "title": "Phase 2: Core Backend & Database",
      "description": "...",
      "prompt": "...",
      "platforms": ["Claude", "Cursor", "Antigravity"]
    }},
    {{
      "title": "Phase 3: Frontend & UI Implementation",
      "description": "...",
      "prompt": "...",
      "platforms": ["Claude", "Cursor", "Bolt.new", "Lovable", "v0.dev"]
    }},
    {{
      "title": "Phase 4: Testing, Polish & Deployment",
      "description": "...",
      "prompt": "...",
      "platforms": ["Claude", "Cursor", "Windsurf"]
    }}
  ]
}}"""


def generate_prompts(requirements: dict, tech_stack: dict, diagrams: dict | None = None) -> dict:
    """Generate phased development prompts."""
    project_type = requirements.get("project_type", "Web Application")
    scale = requirements.get("scale", "medium")
    language = requirements.get("preferred_language", "")
    platforms = ", ".join(requirements.get("platform_type", ["Web App"]))
    pinned = ", ".join(requirements.get("pinned_techs", []))
    notes = requirements.get("notes", "")

    # Build tech summary
    tech_summary = ""
    if tech_stack and "components" in tech_stack:
        lines = []
        for key, comp in tech_stack["components"].items():
            if comp.get("options"):
                top = comp["options"][0]
                lines.append(f"- {comp['name']}: {top['name']}")
        tech_summary = "\n".join(lines)

    if GEMINI_API_KEY:
        return _generate_with_llm(
            project_type, scale, language, platforms, pinned, notes, tech_summary
        )

    return _generate_deterministic(
        project_type, scale, language, platforms, pinned, notes, tech_summary
    )


def _generate_with_llm(
    project_type: str,
    scale: str,
    language: str,
    platforms: str,
    pinned: str,
    notes: str,
    tech_summary: str,
) -> dict:
    """Use Gemini to generate prompts."""
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = PROMPT_GENERATION_TEMPLATE.format(
            project_type=project_type,
            scale=scale,
            language=language or "any",
            platforms=platforms,
            pinned_techs=pinned or "None",
            notes=notes or "None",
            tech_summary=tech_summary or "Not specified",
        )

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)
        return result

    except Exception as exc:
        logger.error("LLM prompt generation failed: %s", exc)
        return _generate_deterministic(
            project_type, scale, language, platforms, pinned, notes, tech_summary
        )


def _generate_deterministic(
    project_type: str,
    scale: str,
    language: str,
    platforms: str,
    pinned: str,
    notes: str,
    tech_summary: str,
) -> dict:
    """Fallback: generate template-based prompts without an LLM."""
    return {
        "phases": [
            {
                "title": "Phase 1: Project Setup & Foundation",
                "description": "Initialize the project structure, install dependencies, configure the development environment, and set up the base architecture.",
                "prompt": f"""I am building a {project_type} ({scale} scale) targeting {platforms}.

Tech stack to use:
{tech_summary}

{f"Preferred language: {language}" if language else ""}
{f"Must use: {pinned}" if pinned else ""}
{f"Additional notes: {notes}" if notes else ""}

Phase 1 - Project Setup & Foundation:

1. Create the complete project folder structure with all necessary directories.
2. Initialize the project with the appropriate package manager and install all dependencies listed in the tech stack.
3. Set up the configuration files: environment variables (.env with placeholders), linting, formatting, and TypeScript/language config.
4. Create the base application entry point with routing configured.
5. Set up the database connection and ORM/query builder configuration.
6. Implement a basic health check endpoint to verify the setup works.
7. Create a README.md with setup instructions.

Do NOT skip any step. Provide the complete code for every file. Use professional naming conventions and add brief comments explaining non-obvious decisions.""",
                "platforms": ["Claude", "Cursor", "Bolt.new", "Lovable", "Replit", "Antigravity"],
            },
            {
                "title": "Phase 2: Core Backend & Database",
                "description": "Build the database schema, API endpoints, authentication system, and core business logic.",
                "prompt": f"""Continue building the {project_type}. This is Phase 2.

Phase 2 - Core Backend & Database:

1. Create the complete database schema with all tables, relationships, indexes, and constraints. Include migration files.
2. Implement the authentication system (sign up, sign in, sign out, password reset) with proper JWT/session handling.
3. Build all core API endpoints with proper request validation, error handling, and response formatting.
4. Implement role-based access control (RBAC) if applicable.
5. Add input sanitization and security middleware (CORS, rate limiting, helmet).
6. Create seed data scripts for development and testing.
7. Write the core business logic services that the API endpoints call.

Important:
- Every endpoint must have proper error responses (400, 401, 403, 404, 500).
- Use proper HTTP methods (GET, POST, PUT, DELETE).
- Add request validation on all endpoints.
- Do NOT use emojis in any code, comments, or responses.""",
                "platforms": ["Claude", "Cursor", "Antigravity"],
            },
            {
                "title": "Phase 3: Frontend & UI Implementation",
                "description": "Build the user interface, connect it to the backend APIs, implement state management, and add responsive design.",
                "prompt": f"""Continue building the {project_type}. This is Phase 3.

Phase 3 - Frontend & UI Implementation:

1. Create all page components with proper routing and navigation.
2. Build reusable UI components: buttons, inputs, cards, modals, tables, loading states, error boundaries.
3. Implement the authentication UI: sign-in page, sign-up page, protected routes.
4. Connect all pages to the backend API with proper loading and error states.
5. Implement client-side form validation on all forms.
6. Add responsive design (mobile, tablet, desktop breakpoints).
7. Implement state management for global state (auth, user data).
8. Add proper page titles and meta tags for each page.

Design requirements:
- Dark theme with professional aesthetics.
- Consistent spacing and typography.
- Smooth transitions and micro-animations where appropriate.
- No placeholder content -- use realistic sample data.
- Do NOT use emojis anywhere in the UI.""",
                "platforms": ["Claude", "Cursor", "Bolt.new", "Lovable", "v0.dev"],
            },
            {
                "title": "Phase 4: Testing, Polish & Deployment",
                "description": "Add error handling, write tests, optimize performance, and configure deployment.",
                "prompt": f"""Continue building the {project_type}. This is Phase 4 (final).

Phase 4 - Testing, Polish & Deployment:

1. Add comprehensive error handling throughout the application (try/catch, error boundaries, fallback UIs).
2. Write unit tests for critical business logic functions.
3. Write integration tests for the main API endpoints.
4. Add loading skeletons and empty states for all data-dependent views.
5. Optimize performance: lazy loading, code splitting, image optimization, caching headers.
6. Create the production build configuration.
7. Set up deployment configuration (Dockerfile, docker-compose, or platform-specific config).
8. Create a final .env.example file documenting all required environment variables.
9. Update the README.md with:
   - Complete setup instructions
   - Environment variable documentation
   - Deployment guide
   - API documentation summary

Do NOT skip any step. This is the final phase -- ensure everything is production-ready.""",
                "platforms": ["Claude", "Cursor", "Windsurf", "Antigravity"],
            },
        ]
    }
