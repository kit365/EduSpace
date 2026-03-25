"""Application factory (assemble routers, middleware)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import configure_logging

# Đăng ký HEIC (pillow-heif) trước khi xử lý upload — side effect khi import module.
import app.utils.image_decode  # noqa: F401

from app.api.routes.face_router import router as face_rt
from app.api.routes.health_router import router as health_rt
from app.api.routes.liveness_router import router as liveness_rt
from app.api.routes.ocr_router import router as ocr_rt


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title="EduSpace AI Service",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Luôn bật CORS: FE dev (Vite) gọi trực tiếp.
    _origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Thêm từ settings nêú có
    if settings.cors_origins:
        extra = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
        _origins.extend(extra)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def root():
        """Tránh 404 khi mở http://127.0.0.1:8000/ trên trình duyệt."""
        return {
            "service": "eduspace-ai",
            "message": "API đang chạy. Mở /docs để thử Swagger.",
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
        }

    app.include_router(health_rt)
    app.include_router(ocr_rt)
    app.include_router(face_rt)
    app.include_router(liveness_rt)
    return app
