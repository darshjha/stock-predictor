# ---------- Front-end build ----------
FROM node:lts-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend ./
RUN npm run build  # outputs to .next

# ---------- API / final image ----------
FROM python:3.11-slim AS api
WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend & model
COPY src ./src
COPY app ./app
COPY models ./models

# Copy pre-built front-end
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

ENV PORT=8000

EXPOSE 8000

# TODO: use an ASGI process manager (e.g., gunicorn+uvicorn workers) for prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]