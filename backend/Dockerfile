FROM python:3.13-slim

WORKDIR /app

# psycopg[binary] ships its own libpq, so no compiler or PostgreSQL client is needed.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# One process: SQLite allows one writer at a time, and this is the configuration the load test measured.
# Railway sets PORT; 8000 is the local default.
ENV PYTHONUNBUFFERED=1
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
