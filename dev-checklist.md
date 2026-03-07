# Dev Checklist — Next Priority Tasks

## 🔐 Authentication & Authorisation

- [ ] Enable Supabase Auth (email + social providers)
- [ ] Add JWT middleware to FastAPI (`Authorization: Bearer <token>`)
- [ ] Scope projects to authenticated users (`user_id` column in `projects` table)
- [ ] Add Row Level Security (RLS) policies in Supabase
- [ ] Frontend: add login/signup page + protected routes

## ⚡ Caching

- [ ] Add Redis (or Upstash) for caching Exa AI results
- [ ] Cache key: SHA256 of normalised search query
- [ ] TTL: 24 hours for realtime results, 7 days for curated
- [ ] Add `X-Cache-Hit` header to discovery responses
- [ ] Consider caching generated comparisons for identical requirements

## 💰 Cost Monitoring

- [ ] Track Exa API calls per project (store in `metadata` table)
- [ ] Add daily/monthly usage counters per user
- [ ] Log estimated cost per request (Exa pricing: ~$0.001/search)
- [ ] Add `/api/admin/usage` endpoint (admin-only)
- [ ] Set up alerts when approaching budget limits

## 🚦 SERP Throttling & Rate Limiting

- [ ] Add per-user rate limiter (e.g., `slowapi` or custom middleware)
- [ ] Default: 10 discovery calls/hour for free tier
- [ ] Implement request queuing for burst traffic
- [ ] Add exponential backoff for Exa 429 responses (already stubbed)
- [ ] Consider circuit-breaker pattern for Exa outages

## 🧠 Switching Embeddings Provider

The current setup uses ChromaDB's default embeddings (Sentence Transformers,
auto-downloaded on first use, ~90 MB model).

### Option A: Stay with Sentence Transformers (current)
- **Pros**: Free, local, no API key needed
- **Cons**: ~90 MB download, CPU-only, single-threaded
- **When**: Dev/hobby, small knowledge bases

### Option B: Google Gemini Embeddings
```python
# pip install google-generativeai
import google.generativeai as genai
genai.configure(api_key=GEMINI_API_KEY)
result = genai.embed_content(model="models/embedding-001", content="text")
embedding = result['embedding']
```
- **Pros**: High quality, supports many languages
- **Cons**: API cost (~$0.00001/1K chars), network dependency
- **When**: Production with diverse, multilingual content

### Option C: OpenAI Embeddings
```python
# pip install openai
from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)
response = client.embeddings.create(model="text-embedding-3-small", input="text")
embedding = response.data[0].embedding
```
- **Pros**: Best-in-class quality, 1536/3072 dimensions
- **Cons**: API cost (~$0.02/1M tokens), vendor lock-in
- **When**: Production with high accuracy requirements

### Option D: External Embedding Service (e.g., Cohere, Voyage)
- Similar pattern: swap the embedding function in `chroma_client.py`
- ChromaDB supports custom embedding functions via `chromadb.utils.embedding_functions`

### How to switch:
1. Install the provider's SDK
2. Create an `EmbeddingFunction` class implementing ChromaDB's interface:
   ```python
   from chromadb import EmbeddingFunction

   class GeminiEmbeddings(EmbeddingFunction):
       def __call__(self, input: list[str]) -> list[list[float]]:
           # Call Gemini API and return embeddings
           ...
   ```
3. Pass it to `get_or_create_collection(embedding_function=GeminiEmbeddings())`
4. Re-ingest all documents (embeddings are NOT backwards-compatible across providers)

## 🔄 CI/CD

- [ ] Add GitHub Actions workflow: lint (ruff) + test (pytest) + build (frontend)
- [ ] Add pre-commit hooks (ruff, prettier)
- [ ] Auto-deploy to Render on `main` push
- [ ] Add E2E test with Playwright (frontend)

## 📊 Observability

- [ ] Add structured logging (JSON format for production)
- [ ] Integrate Sentry for error tracking
- [ ] Add request timing middleware
- [ ] Track Chroma query latencies
- [ ] Add `/api/metrics` endpoint (Prometheus-compatible)

## 🎨 UX Improvements

- [ ] Add project history page (list saved projects)
- [ ] Add "compare two stacks" side-by-side view
- [ ] Dark mode toggle
- [ ] Mobile-responsive improvements
- [ ] Add skeleton loading states
- [ ] Keyboard shortcuts for power users
