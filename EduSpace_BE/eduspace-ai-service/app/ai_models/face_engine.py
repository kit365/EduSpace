"""DeepFace — single place for face verification."""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path
from typing import Any

import cv2

from app.core.config import settings
from app.utils.image_decode import decode_bgr

_log = logging.getLogger(__name__)
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")


def _write_temp_jpg_from_bytes(image_bytes: bytes) -> str:
    """Decode (HEIC/JPEG/…) → BGR → JPEG file for DeepFace (raw HEIC bytes are not valid .jpg)."""
    img = decode_bgr(image_bytes)
    fd, path = tempfile.mkstemp(suffix=".jpg")
    os.close(fd)
    try:
        if not cv2.imwrite(path, img):
            raise ValueError("Could not encode image to JPEG for face verification")
        return path
    except Exception:
        Path(path).unlink(missing_ok=True)
        raise


def _verify_deepface(
    p1: str,
    p2: str,
    model_name: str,
    detector_backend: str,
    expand_percentage: int,
) -> dict[str, Any]:
    from deepface import DeepFace

    return DeepFace.verify(
        img1_path=p1,
        img2_path=p2,
        model_name=model_name,
        enforce_detection=True,
        align=True,
        detector_backend=detector_backend,
        expand_percentage=expand_percentage,
    )


def verify_faces(selfie_bytes: bytes, id_front_bytes: bytes, model_name: str = "VGG-Face") -> dict[str, Any]:
    p1 = _write_temp_jpg_from_bytes(selfie_bytes)
    p2 = _write_temp_jpg_from_bytes(id_front_bytes)
    primary = settings.face_detector_backend
    fallbacks = ("mtcnn", "opencv")
    try:
        try:
            result = None
            used_backend = primary
            try:
                result = _verify_deepface(
                    p1,
                    p2,
                    model_name,
                    primary,
                    settings.face_expand_percentage,
                )
            except Exception as first:
                _log.warning("DeepFace verify backend=%s: %s", primary, first)
                for fb in fallbacks:
                    if fb == primary:
                        continue
                    try:
                        result = _verify_deepface(
                            p1,
                            p2,
                            model_name,
                            fb,
                            settings.face_expand_percentage,
                        )
                        used_backend = fb
                        break
                    except Exception as e:
                        _log.warning("DeepFace verify backend=%s: %s", fb, e)
                if result is None:
                    raise first
            _log.debug("DeepFace verify used detector_backend=%s", used_backend)
        except Exception as e:
            _log.warning("DeepFace verify: %s", e)
            return {
                "verified": False,
                "distance": 1.0,
                "threshold": 0.68,
                "model": model_name,
                "error": str(e),
            }
        verified = bool(result.get("verified"))
        distance = float(result.get("distance", 1.0))
        threshold = float(result.get("threshold", 0.68))
        return {
            "verified": verified,
            "distance": distance,
            "threshold": threshold,
            "model": model_name,
            "detector_backend": used_backend,
        }
    finally:
        for p in (p1, p2):
            try:
                Path(p).unlink(missing_ok=True)
            except OSError:
                pass
