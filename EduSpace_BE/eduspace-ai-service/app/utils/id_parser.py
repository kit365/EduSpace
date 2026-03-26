"""Heuristic parsing of Vietnamese national ID fields from OCR lines."""

from __future__ import annotations

import re
from typing import Any

def _join_lines(lines: list[tuple[str, float]]) -> str:
    return "\n".join(t for t, _ in lines)

def parse_id_fields(full_text: str, lines: list[tuple[str, float]]) -> dict[str, Any]:
    text = full_text.upper()
    out: dict[str, Any] = {
        "name": None,
        "id_number": None,
        "dob": None,
        "address": None,
        "expiry_date": None,
    }

    # --- LẤY SỐ CCCD ---
    m12 = re.search(r"\b(\d{12})\b", full_text)
    m9 = re.search(r"\b(\d{9})\b", full_text)
    if m12:
        out["id_number"] = m12.group(1)
    elif m9:
        out["id_number"] = m9.group(1)

    # --- LẤY NGÀY SINH & HẠN SỬ DỤNG ---
    dates = re.findall(r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b", full_text)
    if dates:
        out["dob"] = dates[0].replace("-", "/")
        if len(dates) > 1:
            out["expiry_date"] = dates[-1].replace("-", "/")

    # --- LẤY HỌ VÀ TÊN ---
    for i, raw in enumerate(line[0] for line in lines):
        s = raw.strip()
        up = s.upper()
        if "HO VA TEN" in up or "HỌ VÀ TÊN" in up or "HO TEN" in up:
            if i + 1 < len(lines):
                candidate = lines[i + 1][0].strip()
                if len(candidate) > 3 and not candidate.isdigit():
                    out["name"] = candidate.title()
            break

    if out["name"] is None:
        best = None
        best_len = 0
        for s, _ in lines:
            t = s.strip()
            if len(t) < 5:
                continue
            if re.match(r"^[\wÀ-ỹ\s]+$", t, re.UNICODE) and not t.isdigit():
                if len(t) > best_len:
                    best_len = len(t)
                    best = t
        if best:
            out["name"] = best.title()

    # --- LẤY ĐỊA CHỈ (THUẬT TOÁN GOM DÒNG NÉ RÁC + LÀM ĐẸP) ---
    raw_lines = full_text.split('\n')
    address_parts = []
    is_reading_address = False

    for line in raw_lines:
        line = line.strip()
        if not line:
            continue
        
        lower_line = line.lower()
        
        # 1. Bắt đầu tìm thấy từ khóa CCCD mới (Nơi thường trú)
        if "thuong tru" in lower_line or "residence" in lower_line or "thường trú" in lower_line:
            is_reading_address = True
            if ":" in line:
                tail = line.split(":", 1)[1].strip()
                if tail:
                    address_parts.append(tail)
            continue

        # 2. Đang trong luồng đọc địa chỉ thì lọc rác
        if is_reading_address:
            # Né các dòng về hạn sử dụng bị kẹt vào giữa
            if "giatridén" in lower_line or "expiry" in lower_line or "giá trị đến" in lower_line or "giatri" in lower_line:
                continue
            
            # Né chuỗi ngày tháng (VD: 18/11/2029)
            if re.search(r'\d{2}[/-]\d{2}[/-]\d{4}', line):
                continue

            # Dừng lại nếu đụng phần cuối thẻ
            if "nhan dang" in lower_line or "identification" in lower_line or "dấu vết" in lower_line or "dđnd" in lower_line:
                break

            # Lấy các mảnh địa chỉ sạch
            address_parts.append(line)

    if address_parts:
        # Nối mượt mà bằng dấu phẩy và khoảng trắng
        final_address = ", ".join(address_parts)
        
        # --- MAKEUP MAKEUP MAKEUP ---
        # 1. Tách chữ thường dính chữ hoa (VD: TayQuan -> Tay Quan)
        final_address = re.sub(r'([a-zà-ỹ])([A-ZÀ-Ỹ])', r'\1 \2', final_address)
        
        # 2. Tách số dính chữ (VD: 7TP -> 7 TP, 3Khu -> 3 Khu)
        final_address = re.sub(r'(\d)([A-ZÀ-Ỹa-zà-ỹ])', r'\1 \2', final_address)
        
        # 3. Thêm dấu cách sau dấu chấm/phẩy nếu OCR nuốt mất (VD: P.Tan -> P. Tan)
        final_address = re.sub(r'([.,])([^\s])', r'\1 \2', final_address)
        
        out["address"] = final_address

    return out