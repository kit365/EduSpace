"""Heuristic parsing of Vietnamese national ID fields from OCR lines."""

from __future__ import annotations
import re
from typing import Any

# Danh sách "Đen" - Thấy mấy chữ này thì tuyệt đối không lấy làm Tên
EXCLUDE_KEYWORDS = [
    "CONG HOA", "XÃ HỘI", "CHỦ NGHĨA", "VIỆT NAM", "DOC LAP", "TU DO", "HANH PHUC",
    "CỤC TRƯỞNG", "DIRECTOR GENERAL", "POLICE", "DEPARTMENT", "ADMINISTRATION",
    "SOCIALIST", "REPUBLIC", "IDENTITY", "CARD", "CĂN CƯỚC", "CHỨNG MINH",
    "GIA TRỊ ĐẾN", "EXPIRY", "QUÊ QUÁN", "NƠI THƯỜNG TRÚ", "NƠI ĐĂNG KÝ",
    "C06", "AN NINH", "CANH SAT", "CHÍNH PHỦ", "NGÖN TRÖ", "INDEX FINGER", "PHẠM CÔNG NGUYÊN"
]

def parse_id_fields(full_text: str, lines: list[tuple[str, float]]) -> dict[str, Any]:
    out: dict[str, Any] = {
        "name": None,
        "id_number": None,
        "dob": None,
        "address": None,
        "expiry_date": None,
    }

    # --- 1. LẤY SỐ CCCD ---
    # Relax boundary \b since OCR might join numbers with labels like 'No.' or 'S/'
    m12 = re.search(r"(\d{12})", full_text)
    m9 = re.search(r"(\d{9})", full_text)
    out["id_number"] = m12.group(1) if m12 else (m9.group(1) if m9 else None)

    # --- 2. LẤY NGÀY SINH & HẠN SỬ DỤNG ---
    dates = re.findall(r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b", full_text)
    if dates:
        out["dob"] = dates[0].replace("-", "/")
        if len(dates) > 1:
            out["expiry_date"] = dates[-1].replace("-", "/")

    # --- 3. LẤY HỌ VÀ TÊN ---
    raw_lines = [line[0].strip() for line in lines]
    
    # Cách A: Tìm theo Keyword (Dùng Regex để chấp nhận OCR sai dấu: "tenl", "name.")
    for i, s in enumerate(raw_lines):
        up = s.upper()
        if re.search(r"(HO TEN|HO VA TEN|FULL NAME|NAME)", up):
            if i + 1 < len(raw_lines):
                candidate = raw_lines[i + 1].strip()
                # Tên CCCD chuẩn phải in hoa, không có số
                if len(candidate) > 3 and candidate.isupper() and not any(c.isdigit() for c in candidate):
                    out["name"] = candidate.title()
                    break

    # Cách B: Nếu là mặt sau (Tìm trong dòng MRZ có dạng NGO<<TUAN<KIET)
    if out["name"] is None:
        mrz_match = re.search(r"([A-Z]+<<[A-Z]+<[A-Z]+)", full_text.upper())
        if mrz_match:
            name_raw = mrz_match.group(1).replace("<<", " ").replace("<", " ")
            out["name"] = name_raw.title()

    # Cách C: Lọc rác lấy dòng IN HOA dài nhất
    if out["name"] is None:
        best = None
        best_len = 0
        for s in raw_lines:
            up_s = s.upper()
            if any(kw in up_s for kw in EXCLUDE_KEYWORDS): continue
            if len(s) > 5 and s.isupper() and not any(c.isdigit() for c in s):
                if len(s) > best_len:
                    best_len = len(s)
                    best = s
        if best:
            out["name"] = best.title()

    # --- 4. LẤY ĐỊA CHỈ (Makeup logic) ---
    address_parts = []
    is_reading_address = False
    for line in full_text.split('\n'):
        line = line.strip()
        if not line: continue
        low = line.lower()
        if any(kw in low for kw in ["thuong tru", "residence", "thường trú"]):
            is_reading_address = True
            if ":" in line:
                tail = line.split(":", 1)[1].strip()
                if tail: address_parts.append(tail)
            continue
        if is_reading_address:
            if any(kw in low for kw in ["nhan dang", "dđnd"]): break
            if re.search(r'\d{2}[/-]\d{2}[/-]\d{4}', line): continue
            address_parts.append(line)

    if address_parts:
        addr = ", ".join(address_parts)
        # 1. Tách chữ thường dính chữ hoa (VD: TayQuan -> Tay Quan)
        addr = re.sub(r'([a-zà-ỹ])([A-ZÀ-Ỹ])', r'\1 \2', addr)
        # 2. Tách số dính chữ (VD: 7TP -> 7 TP)
        addr = re.sub(r'(\d)([A-ZÀ-Ỹa-zà-ỹ])', r'\1 \2', addr)
        # 3. Tách chữ dính số (VD: KhuPh3 -> KhuPh 3)
        addr = re.sub(r'([A-ZÀ-Ỹa-zà-ỹ])(\d)', r'\1 \2', addr)
        # 5. Mở rộng viết tắt (Ph -> phố, P -> Phường, Q -> Quận)
        # Ưu tiên Khu Ph -> Khu phố
        addr = re.sub(r'(?i)\bKhu\s*Ph\b', 'Khu phố', addr)
        # Các chữ cái đứng cạnh số (P1 -> Phường 1, Q7 -> Quận 7)
        addr = re.sub(r'(?i)\bP\s*(\d+)', r'Phường \1', addr)
        addr = re.sub(r'(?i)\bQ\s*(\d+)', r'Quận \1', addr)
        # Dấu chấm viết tắt (P. -> Phường, Q. -> Quận)
        addr = re.sub(r'(?i)\bP\.\s+', 'Phường ', addr)
        addr = re.sub(r'(?i)\bQ\.\s+', 'Quận ', addr)
        addr = re.sub(r'(?i)\bTP\.\s*', 'TP. ', addr)
        
        # Làm sạch rác (từ khóa kẹt lại)
        addr = re.sub(r'(?i)Date of expiry|Date ot expiry|Gia tri den|Gia tri', '', addr)
        
        # Xóa dấu phẩy thừa
        addr = re.sub(r',\s*,', ',', addr)
        out["address"] = addr.strip(", ")

    return out