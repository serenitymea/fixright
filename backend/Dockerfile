FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Prevent .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install OS-level build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose the API port
EXPOSE 8000

# Start the ASGI server
# --reload is fine for development; remove it for production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]