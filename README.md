<div align="center">

# Tech-Stack Recommender

**AI-powered platform that recommends the optimal technology stack for your project based on requirements, budget, and scale.**

</div>

---

## The Problem and Our Mission

People often struggle to discover new tech tools. The software ecosystem evolves at a relentless pace, and keeping track of emerging frameworks, databases, hosting solutions, and AI toolkits is a full-time job in itself. Teams frequently default to familiar but outdated or overpriced technologies, and end up paying more than they should, both in infrastructure costs and in developer hours.

**Our goal is to save you money by providing the best and latest updates.** Tech-Stack Recommender acts as your intelligent research partner: you describe what you are building, and the system returns a tailored, cost-optimised set of technologies backed by real-time data and curated expert knowledge. No more guesswork, no more overspending.

---

## System Architecture

```
+--------------+       +--------------------------------------------+
|   Frontend   |  API  |            Backend  (FastAPI)               |
|  React+Vite  |<----->|                                            |
|  Tailwind v4 |       |  /api/parse     -> normalise + queries     |
|  Port 5173   |       |  /api/discover  -> hybrid retrieval        |
+--------------+       |  /api/generate  -> LLM comparison table    |
                       |  /api/project   -> saved projects          |
                       |  /api/export-pdf-> PDF generation          |
                       |                                            |
                       |  +--------+  +---------+  +------------+  |
                       |  | Chroma |  |Supabase |  |   Exa AI   |  |
                       |  |(local) |  |(PG+Auth)|  |  (search)  |  |
                       |  +--------+  +---------+  +------------+  |
                       +--------------------------------------------+
```

### Hybrid Retrieval Pipeline

1. On startup, curated PDFs from `backend/knowledge_base/` are embedded into ChromaDB.
2. When a user submits requirements, ChromaDB is queried first for high-confidence matches.
3. If similarity is high (>= 0.75) and project is simple, curated results are returned (fast, free).
4. If similarity is low or the project is complex, Exa AI is called for realtime discovery; results are cached in ChromaDB.
5. The response includes `retrieval_source` ("curated" | "realtime" | "hybrid") and `confidence_score`.

---

## Developer Guide

This section is written from a developer's point of view. It explains the purpose of every significant file and directory, the data flow through the system, and the conventions used across the codebase.

### Request Lifecycle

The following diagram shows the complete journey of a user request through the system.

```
User (Browser)
     |
     v
[InputForm.jsx]  -- POST /api/parse -->  [parse.py]
     |                                       |
     | parsed requirements                   | UserInput -> ParsedRequirements
     v                                       v
[RequirementsPanel.jsx]                 [discover.py]
     |                                       |
     | user confirms                         | queries ChromaDB + Exa AI
     v                                       v
[ResultsTable.jsx]  <-- POST /api/generate --  [generate.py]
     |                                              |
     | comparison matrix                            | LLM or deterministic builder
     v                                              v
[PDFExportButton.jsx]  -- POST /api/export-pdf -->  [export.py]
                                                       |
                                                       v
                                                  PDF saved to /storage
                                                  or Supabase Storage
```

---

### Backend File Reference

All backend code lives under `backend/`. The application is built with **FastAPI** and follows a layered architecture: routers handle HTTP, services handle business logic, and models define the data contracts.

#### Core Application

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI entry point. Defines the application lifespan (startup/shutdown), registers all routers, configures CORS for the Vite dev server, and exposes the `/health` endpoint. On startup it validates config, initialises ChromaDB, ingests curated PDFs, and pings Supabase. |
| `app/config.py` | Centralised environment configuration. Loads `.env` from the project root at import time using `python-dotenv`. Exposes all required (`EXA_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`) and optional (`GEMINI_API_KEY`, `CHROMA_DIR`, etc.) variables as typed module-level constants. Raises immediately if a required key is missing. |

#### Routers (API Endpoints)

Each router is a self-contained FastAPI `APIRouter` mounted under the `/api` prefix.

| File | Endpoint | Purpose |
|---|---|---|
| `app/routers/parse.py` | `POST /api/parse` | Accepts raw `UserInput`, normalises the fields (scale, pricing model, platform), and generates 4-6 targeted search queries for downstream discovery. Returns a `ParsedRequirements` object. |
| `app/routers/discover.py` | `POST /api/discover` | Receives `ParsedRequirements`, runs the hybrid retrieval pipeline (ChromaDB first, Exa AI if needed), and returns a `DiscoveryResult` containing categorised technology candidates with confidence scores. |
| `app/routers/generate.py` | `POST /api/generate` | Takes `ParsedRequirements` + `DiscoveryResult`, delegates to the LLM orchestrator, and returns a `ComparisonResult` with side-by-side option matrices, cost estimates, and best-pick recommendations. |
| `app/routers/project.py` | `GET /api/project/{id}` | Retrieves a saved project record from Supabase by its UUID. Returns a full `ProjectRecord` including all intermediate and final artefacts. |
| `app/routers/export.py` | `POST /api/export-pdf` | Accepts a `ComparisonResult`, generates a formatted PDF report, stores it locally (or in Supabase Storage if configured), and returns the download URL. |

#### Services (Business Logic)

| File | Purpose |
|---|---|
| `app/services/chroma_client.py` | Manages the local ChromaDB persistent vector store. Provides `get_collection()` (singleton initialisation), `upsert_documents()`, `query()` (semantic search with cosine similarity conversion), and `load_curated_pdfs()` (ingests every PDF from `knowledge_base/`, chunks text into 1000-char overlapping segments, and indexes them with `source=curated` metadata). |
| `app/services/exa_client.py` | Async wrapper around the Exa AI search API. Sends the search queries generated by the parse step and returns structured technology candidates grouped by category. |
| `app/services/supabase_client.py` | Thin client around the Supabase Python SDK. Handles project persistence (insert/select on the `projects` and `metadata` tables) and optional file uploads to Supabase Storage. |
| `app/services/llm_orchestrator.py` | Builds the final comparison table. If `GEMINI_API_KEY` is set, it loads prompt templates from `prompts/`, fills in variables, calls the Gemini API, and parses the structured JSON response into a `ComparisonResult`. Otherwise, it falls back to a deterministic rule-based builder that produces a reasonable comparison without any LLM call. |
| `app/services/pdf_generator.py` | Generates downloadable PDF reports from a `ComparisonResult`. Uses WeasyPrint or ReportLab to produce a cleanly formatted document with comparison tables, cost breakdowns, and recommendation summaries. |

#### Data Models

| File | Key Classes | Purpose |
|---|---|---|
| `app/models/schemas.py` | `UserInput` | Raw form submission: project type, scale, pricing model, language, platform, pinned techs, notes. |
| | `ParsedRequirements` | Normalised requirements plus 4-6 auto-generated Exa search queries. |
| | `DiscoveryCandidate` | A single technology option (name, category, pros, cons, URL, confidence score, source). |
| | `DiscoveryResult` | Aggregated candidates grouped by category, with overall retrieval source and confidence. |
| | `ComponentOption` | One option within a stack component (name, pros, cons, complexity, monthly cost estimate, license). |
| | `ComparisonComponent` | A stack component (e.g., "frontend") with its list of `ComponentOption` entries. |
| | `ComparisonResult` | Full comparison table: components dict, best-MVP/scale/budget picks, and per-category explanations. |
| | `ProjectRecord` | Persisted project linking all artefacts (user input, parsed requirements, discovery, comparison, PDF URL). |
| | `ExportPDFRequest` | Payload for the PDF export endpoint. |

#### Supporting Directories

| Directory | Purpose |
|---|---|
| `knowledge_base/` | Drop curated `.pdf` files here containing pre-built tech stack guides. They are automatically chunked, embedded, and indexed into ChromaDB on every server startup. |
| `sample_data/` | Contains `demo_seeds.json` with example inputs and expected outputs for testing and demonstration. |
| `workers/` | Background processing scripts. `discovery_worker.py` runs a deep, long-running discovery pass for a given project UUID (useful for batch or async processing). |
| `tests/` | Pytest test suite. `test_parse.py` validates the parsing and normalisation logic. `test_chroma.py` validates ChromaDB ingestion and query operations. |
| `storage/` | Auto-created on startup. Stores generated PDF files locally before they are served or uploaded. |

---

### Frontend File Reference

The frontend is a **React** single-page application bootstrapped with **Vite** and styled with **Tailwind CSS v4**. All source code lives under `frontend/src/`.

#### Application Shell

| File | Purpose |
|---|---|
| `src/main.jsx` | Vite entry point. Mounts the React app into the DOM and wraps it with `BrowserRouter` for client-side routing. |
| `src/App.jsx` | Root component. Renders the global header (app name, version badge) and sets up `<Routes>` for page-level navigation. |
| `src/index.css` | Global stylesheet. Imports Tailwind directives and defines any custom base styles. |

#### Pages

| File | Purpose |
|---|---|
| `src/pages/HomePage.jsx` | The main (and currently only) page. Orchestrates the full user flow: renders `InputForm`, transitions to `RequirementsPanel` after parsing, displays `ResultsTable` after generation, and offers `PDFExportButton` at the end. |

#### Components

| File | Purpose |
|---|---|
| `src/components/InputForm.jsx` | Multi-field form collecting project type, scale, pricing model, preferred language, platform targets, pinned technologies, and free-form notes. Submits to `POST /api/parse`. |
| `src/components/RequirementsPanel.jsx` | Displays the parsed and normalised requirements returned by the backend. Allows the user to review before proceeding to discovery and generation. |
| `src/components/ResultsTable.jsx` | Renders the comparison matrix returned by `/api/generate`. Shows each stack component with its options, pros/cons, cost estimates, and the recommended picks (best MVP, best for scale, best for budget). |
| `src/components/PDFExportButton.jsx` | Triggers a `POST /api/export-pdf` call and opens the returned PDF URL in a new tab for download. |
| `src/components/LoadingSpinner.jsx` | Reusable animated spinner shown during async API calls. |
| `src/components/Tooltip.jsx` | Lightweight tooltip component used to show additional context on hover (e.g., technology descriptions, cost breakdowns). |

#### API Client

| File | Purpose |
|---|---|
| `src/api/client.js` | Centralised HTTP client. Defines base URL, request helpers (`post`, `get`), and error handling for all backend API calls. |

---

### Prompt Templates

| File | Purpose |
|---|---|
| `prompts/parse_prompt.txt` | Instruction template fed to the LLM during the parse step. Guides the model to normalise user inputs and generate targeted search queries. |
| `prompts/generate_prompt.txt` | Instruction template fed to the LLM during comparison generation. Defines the expected JSON output schema, evaluation criteria, and tone for explanations. |

---

### Infrastructure and DevOps

| File | Purpose |
|---|---|
| `docker-compose.yml` | Orchestrates both the backend and frontend containers. Backend runs on port 8000, frontend on port 3000. |
| `backend/Dockerfile` | Multi-stage Docker build for the FastAPI backend. Installs Python dependencies and runs `uvicorn`. |
| `frontend/Dockerfile` | Docker build for the React frontend. Runs `npm install`, builds for production, and serves via a static file server. |
| `render.yaml` | Render.com blueprint. Auto-detected on deploy; defines service names, build commands, and environment variable bindings. |
| `.env.example` | Template for all required and optional environment variables. Copy to `.env` and fill in real values. |
| `dev-checklist.md` | Internal checklist tracking feature progress, open tasks, and known issues. |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys before starting.

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `EXA_API_KEY` | Yes | -- | Exa AI API key for realtime web search |
| `SUPABASE_URL` | Yes | -- | Supabase project URL |
| `SUPABASE_KEY` | Yes | -- | Supabase anon or service role key |
| `GEMINI_API_KEY` | No | -- | Google Gemini API key (enables LLM-powered generation) |
| `CHROMA_DIR` | No | `./chroma_db` | ChromaDB local persistence directory |
| `CHROMA_SIMILARITY_THRESHOLD` | No | `0.75` | Hybrid retrieval sensitivity (0.0 to 1.0) |
| `STORAGE_PATH` | No | `./storage` | Directory for generated PDF files |
| `SUPABASE_STORAGE` | No | -- | Supabase Storage bucket name |
| `FASTAPI_PORT` | No | `8000` | Backend server port |

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.12+
- Node.js 22+
- A Supabase project (free tier works)
- An Exa AI API key

### 1. Clone and Configure

```bash
git clone <repo-url> techntools
cd techntools
cp .env.example .env
# Edit .env with your actual keys
```

### 2. Backend Setup

```bash
cd backend
python -m venv tecvenv

# Windows
tecvenv\Scripts\activate

# macOS / Linux
source tecvenv/bin/activate

pip install -r requirements.txt
```

### 3. Database Initialisation

Run the following SQL in your Supabase SQL editor:

```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_input JSONB,
    parsed_requirements JSONB,
    discovery_result JSONB,
    comparison_result JSONB,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Metadata table (raw search results)
CREATE TABLE metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    raw_results JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Verify: `http://localhost:8000/health` should return `{"status":"ok"}`

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

### 6. Run Tests

```bash
cd backend
pytest tests/ -v
```

### 7. Run the Discovery Worker (optional)

```bash
cd backend
python -m workers.discovery_worker <project-uuid>
```

---

## Docker Deployment

### Build and Run Both Services

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Backend Only

```bash
docker build -t tsr-backend -f backend/Dockerfile .
docker run -p 8000:8000 --env-file .env tsr-backend
```

---

## Deploy to Render

1. Push your code to GitHub.
2. Connect the repository in the Render dashboard.
3. Render auto-detects `render.yaml` and provisions the services.
4. Set environment variables in the Render dashboard.
5. Deploy.

---

## Project Structure

```
techntools/
|-- backend/
|   |-- app/
|   |   |-- main.py                  # FastAPI entry point and lifespan
|   |   |-- config.py                # Environment variable loader
|   |   |-- models/
|   |   |   +-- schemas.py           # All Pydantic v2 data models
|   |   |-- routers/
|   |   |   |-- parse.py             # POST /api/parse
|   |   |   |-- discover.py          # POST /api/discover
|   |   |   |-- generate.py          # POST /api/generate
|   |   |   |-- project.py           # GET  /api/project/{id}
|   |   |   +-- export.py            # POST /api/export-pdf
|   |   +-- services/
|   |       |-- chroma_client.py     # ChromaDB vector store + PDF ingestion
|   |       |-- exa_client.py        # Exa AI async search wrapper
|   |       |-- supabase_client.py   # Supabase persistence and storage
|   |       |-- llm_orchestrator.py  # LLM / deterministic comparison builder
|   |       +-- pdf_generator.py     # PDF report generation
|   |-- knowledge_base/              # Drop curated .pdf guides here
|   |-- sample_data/
|   |   +-- demo_seeds.json          # Example inputs and outputs
|   |-- workers/
|   |   +-- discovery_worker.py      # Background deep-discovery script
|   |-- tests/
|   |   |-- test_parse.py
|   |   +-- test_chroma.py
|   |-- requirements.txt
|   +-- Dockerfile
|-- frontend/
|   |-- src/
|   |   |-- main.jsx                 # Vite + React entry point
|   |   |-- App.jsx                  # Root component and routing
|   |   |-- index.css                # Global styles (Tailwind)
|   |   |-- api/
|   |   |   +-- client.js            # Centralised HTTP client
|   |   |-- pages/
|   |   |   +-- HomePage.jsx         # Main application page
|   |   +-- components/
|   |       |-- InputForm.jsx        # Project requirements form
|   |       |-- RequirementsPanel.jsx # Parsed requirements display
|   |       |-- ResultsTable.jsx     # Comparison matrix view
|   |       |-- PDFExportButton.jsx  # PDF download trigger
|   |       |-- LoadingSpinner.jsx   # Async loading indicator
|   |       +-- Tooltip.jsx          # Hover tooltip utility
|   |-- package.json
|   |-- vite.config.js
|   +-- Dockerfile
|-- prompts/
|   |-- parse_prompt.txt             # LLM parse instruction template
|   +-- generate_prompt.txt          # LLM generation instruction template
|-- docker-compose.yml
|-- render.yaml
|-- .env.example
|-- .gitignore
|-- dev-checklist.md
+-- README.md
```

---

## Curated Knowledge Base

Place PDF files in `backend/knowledge_base/` containing pre-made tech stack recommendations. They are automatically ingested into ChromaDB on every server startup.

See [backend/knowledge_base/README.md](backend/knowledge_base/README.md) for details on format and conventions.

---

## License

MIT

