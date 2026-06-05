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

ENV PYTHONUNBUFFERED=1 \
    PORT=8080

EXPOSE 8080

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8080/api/health || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
