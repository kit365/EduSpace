FROM python:3.10-slim-bookworm

# Install system dependencies
# libgomp1: PaddleOCR
# cmake, g++, gcc: dlib (face-recognition)
# libgl1, libglib2.0-0: OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libglib2.0-0 libsm6 libxext6 libxrender1 libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-load PaddleOCR models
RUN mkdir -p /app/.paddleocr && \
    python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='vi', show_log=False, enable_mkldnn=False)" || true

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
