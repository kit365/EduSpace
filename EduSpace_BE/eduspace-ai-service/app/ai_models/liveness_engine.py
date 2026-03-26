"""
Liveness heuristic (Laplacian). Replace with Silent-Face-Anti-Spoofing when ready.
"""

from __future__ import annotations

from typing import Any

import cv2

from app.utils.image_decode import decode_bgr


def analyze_liveness(image_bytes: bytes) -> dict[str, Any]:
    img = decode_bgr(image_bytes)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(lap.var())

    score = min(1.0, variance / 120.0)
    is_live = score >= 0.08

    return {
        "is_live": is_live,
        "score": round(score, 4),
        "method": "laplacian_heuristic",
        "raw_laplacian_variance": round(variance, 4),
    }
