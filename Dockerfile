# Multi-stage Dockerfile for The Grounded Answer
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend & Runtime
FROM python:3.11-slim AS production
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source code and policy documents
COPY backend/ ./backend/
COPY docs/ ./docs/
COPY scripts/ ./scripts/
COPY .env.example ./.env

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Initialize SQLite database with official policy corpus
RUN python scripts/ingest.py

EXPOSE 8000

# Run Uvicorn server hosting both API and frontend SPA
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
