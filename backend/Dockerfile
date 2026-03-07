FROM python:3.12-slim

# WeasyPrint system dependencies (Pango, HarfBuzz, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz-subset0 \
    libffi-dev \
    libgdk-pixbuf2.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Install Python deps (cached layer)
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy application code (context is project root via render.yaml dockerContext: .)
COPY backend/app/ /code/app/
COPY backend/workers/ /code/workers/
COPY backend/knowledge_base/ /code/knowledge_base/
COPY prompts/ /code/prompts/

# Create storage directory
RUN mkdir -p /code/storage

# Prompts are mounted via docker-compose volumes or copied at build time.
# When building standalone, copy prompts/ into backend/prompts/ first.
# COPY prompts/ /code/prompts/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
