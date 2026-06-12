# Daily Positive — Python + FastAPI
# Serves the GUI at / and the /api/boost endpoint that can pull live positives from X.

FROM python:3.11-slim

WORKDIR /app

# System deps (minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code + frontend
COPY main.py .
COPY static ./static

# Optional .env support (for local dev)
COPY .env* ./

ENV PYTHONUNBUFFERED=1

# Platforms like Render, Railway, etc. inject their own PORT (often 10000).
# Default to 8080 for local/Docker.
EXPOSE 8080

# Dynamic healthcheck + CMD using the PORT env var provided by the platform.
# Use shell form so $PORT is expanded.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT:-8080}/api/health" || exit 1

CMD sh -c "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"
