"""
Diagram generation service — produces Mermaid syntax for ER and flow diagrams.

Uses Gemini LLM to generate context-aware diagrams based on project requirements
and chosen tech stack. Falls back to deterministic templates if no API key.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# ── Mermaid prompt ────────────────────────────────────────────────────────────

ER_PROMPT_TEMPLATE = """You are a senior database architect. Based on the following project requirements, generate a Mermaid ER diagram showing the database schema.

Project: {project_type}
Scale: {scale}
Platform: {platforms}
Notes: {notes}

Instructions:
- Use Mermaid erDiagram syntax.
- Include all relevant entities (tables) with their key attributes.
- Show relationships (one-to-one, one-to-many, many-to-many) with proper cardinality.
- Include 5-10 entities that make sense for this project type.
- Use standard naming conventions (snake_case for tables, lowercase).
- Do NOT include any text outside the Mermaid code block.
- Do NOT use markdown fences — return raw Mermaid syntax only.
- Keep attribute names short and professional.

Return ONLY valid Mermaid erDiagram code."""

FLOW_PROMPT_TEMPLATE = """You are a senior software architect. Based on the following project, generate a Mermaid flowchart showing the complete user journey and application flow.

Project: {project_type}
Scale: {scale}
Platform: {platforms}
Tech Stack: {tech_summary}
Notes: {notes}

Instructions:
- Use Mermaid flowchart TD (top-down) syntax.
- Show the complete user journey from landing/opening the app to the core actions.
- Include authentication flows, main features, and key decision points.
- Use descriptive but concise node labels (no emojis).
- Include 10-20 nodes.
- Use proper Mermaid syntax with --> for connections.
- Do NOT include any text outside the Mermaid code block.
- Do NOT use markdown fences — return raw Mermaid syntax only.
- Use subgraph for grouping related flows.

Return ONLY valid Mermaid flowchart code."""


def generate_diagrams(requirements: dict, tech_stack: dict) -> dict:
    """Generate Mermaid diagram code for ER and flow diagrams."""
    project_type = requirements.get("project_type", "Web Application")
    scale = requirements.get("scale", "medium")
    platforms = ", ".join(requirements.get("platform_type", ["Web App"]))
    notes = requirements.get("notes", "")

    # Summarize tech stack for flow diagram context
    tech_summary = ""
    if tech_stack and "components" in tech_stack:
        parts = []
        for key, comp in tech_stack["components"].items():
            if comp.get("options"):
                parts.append(f"{comp['name']}: {comp['options'][0]['name']}")
        tech_summary = ", ".join(parts[:6])

    if GEMINI_API_KEY:
        return _generate_with_llm(project_type, scale, platforms, notes, tech_summary)

    return _generate_deterministic(project_type, scale, platforms, notes)


def _generate_with_llm(
    project_type: str,
    scale: str,
    platforms: str,
    notes: str,
    tech_summary: str,
) -> dict:
    """Use Gemini to generate diagrams."""
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Generate ER diagram
        er_prompt = ER_PROMPT_TEMPLATE.format(
            project_type=project_type,
            scale=scale,
            platforms=platforms,
            notes=notes or "None",
        )
        er_response = model.generate_content(er_prompt)
        er_code = _clean_mermaid(er_response.text)

        # Generate flow diagram
        flow_prompt = FLOW_PROMPT_TEMPLATE.format(
            project_type=project_type,
            scale=scale,
            platforms=platforms,
            tech_summary=tech_summary,
            notes=notes or "None",
        )
        flow_response = model.generate_content(flow_prompt)
        flow_code = _clean_mermaid(flow_response.text)

        return {
            "er_diagram": er_code,
            "flow_diagram": flow_code,
            "architecture_diagram": None,
        }

    except Exception as exc:
        logger.error("LLM diagram generation failed: %s", exc)
        return _generate_deterministic(project_type, scale, platforms, notes)


def _clean_mermaid(text: str) -> str:
    """Remove markdown fences and clean up Mermaid code."""
    text = text.strip()
    # Remove ```mermaid ... ``` wrappers
    text = re.sub(r'^```(?:mermaid)?\s*\n?', '', text)
    text = re.sub(r'\n?```\s*$', '', text)
    return text.strip()


def _generate_deterministic(
    project_type: str,
    scale: str,
    platforms: str,
    notes: str,
) -> dict:
    """Fallback: generate reasonable diagrams without an LLM."""
    project_lower = project_type.lower()

    # Default ER diagram
    er_diagram = """erDiagram
    users {
        uuid id PK
        string email
        string password_hash
        string full_name
        string role
        timestamp created_at
    }
    profiles {
        uuid id PK
        uuid user_id FK
        string avatar_url
        string bio
        jsonb preferences
    }
    projects {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string status
        timestamp created_at
        timestamp updated_at
    }
    tasks {
        uuid id PK
        uuid project_id FK
        uuid assigned_to FK
        string title
        text description
        string priority
        string status
        timestamp due_date
    }
    notifications {
        uuid id PK
        uuid user_id FK
        string type
        text message
        boolean read
        timestamp created_at
    }
    users ||--o{ profiles : has
    users ||--o{ projects : creates
    users ||--o{ notifications : receives
    projects ||--o{ tasks : contains
    users ||--o{ tasks : assigned"""

    # Customize for e-commerce
    if any(kw in project_lower for kw in ["commerce", "store", "shop", "marketplace"]):
        er_diagram = """erDiagram
    users {
        uuid id PK
        string email
        string password_hash
        string full_name
        string role
        timestamp created_at
    }
    products {
        uuid id PK
        uuid seller_id FK
        string name
        text description
        decimal price
        integer stock
        string category
        string status
    }
    orders {
        uuid id PK
        uuid user_id FK
        decimal total
        string status
        string payment_status
        timestamp created_at
    }
    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
    }
    payments {
        uuid id PK
        uuid order_id FK
        string provider
        string transaction_id
        decimal amount
        string status
    }
    reviews {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        integer rating
        text comment
        timestamp created_at
    }
    users ||--o{ orders : places
    users ||--o{ reviews : writes
    orders ||--o{ order_items : contains
    orders ||--|| payments : has
    products ||--o{ order_items : included_in
    products ||--o{ reviews : receives
    users ||--o{ products : sells"""

    # Default flow diagram
    flow_diagram = """flowchart TD
    A[Landing Page] --> B{Authenticated?}
    B -->|No| C[Sign Up / Sign In]
    C --> D[Dashboard]
    B -->|Yes| D
    D --> E[Browse / Search]
    E --> F[View Details]
    F --> G{Take Action?}
    G -->|Yes| H[Process Action]
    H --> I[Confirmation]
    I --> D
    G -->|No| E
    D --> J[Profile Settings]
    D --> K[Notifications]

    subgraph Admin
        L[Admin Panel] --> M[Manage Users]
        L --> N[View Analytics]
        L --> O[System Settings]
    end"""

    return {
        "er_diagram": er_diagram,
        "flow_diagram": flow_diagram,
        "architecture_diagram": None,
    }
