"""PaddleOCR — single place for OCR model calls."""

from __future__ import annotations

import logging
import os
import threading
import time
from typing import Any, Optional

# Phải đặt trước `from paddleocr import ...` (kéo theo paddle). Hữu ích khi module được import trực tiếp (test) mà không qua app.main.
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

import cv2
import numpy as np
from paddleocr import PaddleOCR

from app.core.config import settings
from app.utils.id_parser import parse_id_fields
from app.utils.image_decode import decode_bgr

_log = logging.getLogger(__name__)
_lock = threading.Lock()
_ocr: Optional[PaddleOCR] = None


def _get_ocr() -> PaddleOCR:
    global _ocr
    with _lock:
        if _ocr is None:
            # lang="vi" → parse_lang dùng bộ nhận dạng latin (chữ có dấu trên CCCD).
            # use_angle_cls=True: bật classifier xoay 180° (ổn trên Docker/Linux; Mac local nếu chậm thì chạy qua Docker).
            # enable_mkldnn=False: API PaddleOCR 2.x (CLI: --enable_mkldnn).
            t_ctor = time.perf_counter()
            _log.info("OCR trace: PaddleOCR.__init__ start (tải model lần đầu có thể vài phút)")
            _ocr = PaddleOCR(
                use_angle_cls=True,
                lang="vi",
                show_log=False,
                enable_mkldnn=False,
            )
            _log.info(
                "OCR trace: PaddleOCR.__init__ done in %.2fs",
                time.perf_counter() - t_ctor,
            )
        return _ocr


def _downscale_for_ocr(img: np.ndarray, max_side: int) -> np.ndarray:
    """Giảm ảnh quá lớn trước Paddle (CPU); giữ tỉ lệ, INTER_AREA hợp thu nhỏ."""
    if max_side <= 0:
        return img
    h, w = int(img.shape[0]), int(img.shape[1])
    m = max(h, w)
    if m <= max_side:
        return img
    scale = max_side / m
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def is_valid_cccd(full_text: str) -> bool:
    """Check if the document contains keywords indicating a Vietnamese ID card."""
    keywords = [
        "CĂN CƯỚC CÔNG DÂN",
        "CHỨNG MINH NHÂN DÂN",
        "SOCIALIST REPUBLIC",
        "ĐỘC LẬP - TỰ DO",
        "IDENTIFICATION",
        "CANCUOCCONGDAN",
    ]
    text_upper = full_text.upper()
    return any(kw in text_upper for kw in keywords)


def run_ocr(image_bytes: bytes) -> dict[str, Any]:
    t_total = time.perf_counter()
    _log.info("OCR trace: step1 decode_bgr start, input_bytes=%d", len(image_bytes))

    t = time.perf_counter()
    img = decode_bgr(image_bytes)
    _log.info(
        "OCR trace: step2 decode_bgr done in %.2fs, shape=%s",
        time.perf_counter() - t,
        getattr(img, "shape", None),
    )

    t = time.perf_counter()
    max_side = settings.ocr_max_side
    before = (int(img.shape[0]), int(img.shape[1]))
    img = _downscale_for_ocr(img, max_side)
    after = (int(img.shape[0]), int(img.shape[1]))
    if before != after:
        _log.info(
            "OCR trace: step2b downscale max_side=%d in %.2fs: %sx%s -> %sx%s",
            max_side,
            time.perf_counter() - t,
            before[0],
            before[1],
            after[0],
            after[1],
        )
    else:
        _log.info("OCR trace: step2b no resize (max_side=%d, image already smaller)", max_side)

    t = time.perf_counter()
    ocr = _get_ocr()
    _log.info("OCR trace: step3 engine ready in %.2fs (since step1: %.2fs)", time.perf_counter() - t, time.perf_counter() - t_total)

    t = time.perf_counter()
    _log.info("OCR trace: step4 ocr.ocr() inference start")
    result = ocr.ocr(img, cls=True)
    _log.info("OCR trace: step5 ocr.ocr() inference done in %.2fs", time.perf_counter() - t)

    lines: list[tuple[str, float]] = []
    seq = None
    if result:
        seq = result[0] if isinstance(result, (list, tuple)) and result else result
    if seq:
        for line in seq:
            if not line or len(line) < 2:
                continue
            txt, conf = line[1][0], line[1][1]
            if txt and conf is not None:
                lines.append((str(txt), float(conf)))

    t = time.perf_counter()
    full_text = "\n".join(t for t, _ in lines)
    
    # Validate if it's an ID card
    if not is_valid_cccd(full_text):
        _log.warning("OCR Validation: Document does not appear to be a valid ID card.")
        return {
            "error": "Not a valid ID card",
            "message": "Vui lòng tải lên ảnh mặt trước Căn cước công dân hoặc Chứng minh nhân dân hợp lệ.",
            "full_text": full_text
        }

    confs = [c for _, c in lines]
    avg_conf = sum(confs) / len(confs) if confs else 0.0
    fields = parse_id_fields(full_text, lines)
    _log.info(
        "OCR trace: step6 parse_id_fields done in %.2fs, lines=%d",
        time.perf_counter() - t,
        len(lines),
    )

    _log.info("OCR trace: finished OK in %.2fs total", time.perf_counter() - t_total)

    return {
        "full_text": full_text,
        "fields": fields,
        "lines": [{"text": t, "confidence": c} for t, c in lines],
        "confidence_avg": round(avg_conf, 4),
    }
