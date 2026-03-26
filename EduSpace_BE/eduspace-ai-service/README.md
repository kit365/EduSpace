# EduSpace AI Service (eKYC)

FastAPI: OCR giấy tờ, so khớp khuôn mặt, liveness (internal — thường chỉ backend Spring gọi).

## Chạy local

```bash
./run-local.sh
```

Hoặc xem phần comment đầu file [`requirements.txt`](requirements.txt).

## Docker Compose (repo `EduSpace_BE`)

Service `eduspace-ai` map cổng host `KYC_AI_PORT` (mặc định **8000**) → 8000 trong container.

**Swagger:** `http://localhost:8000/docs` (đổi `8000` nếu bạn set `KYC_AI_PORT` khác).

**CORS (FE gọi trực tiếp):** biến `KYC_AI_CORS_ORIGINS` — danh sách origin cách nhau bởi dấu phẩy (mặc định trong code: Vite `5173`, CRA `3000`). Ví dụ: `http://localhost:5173,http://127.0.0.1:5173`.

## Swagger (`/docs`) — checklist nhanh

1. **API key** — Nếu đã `export KYC_AI_API_KEY=...` thì trong Swagger nhập cùng giá trị vào **Authorize** / header `X-API-Key`. Nếu biến môi trường để trống, server không bắt buộc key.
2. **`POST /internal/v1/ocr/id-card`** — Trường **`front` bắt buộc**: phải chọn file ảnh; không chọn → **422**.
3. **`back` (tuỳ chọn)** — Chỉ upload khi có ảnh mặt sau; **không** bật «Send empty value» trên Swagger nếu không có file.
4. **Thời gian** — Lần đầu OCR có thể **rất lâu** (tải model PaddleOCR). Swagger không có progress bar — đợi đến khi có response **200** hoặc lỗi.
5. **Định dạng** — JPG/PNG/WebP; HEIC iPhone cần `pillow-heif` (đã khai báo trong requirements).

## Endpoint chính (prefix `/internal/v1`)

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/ocr/id-card` | `front` + tuỳ chọn `back` |
| POST | `/face/verify` | selfie + ảnh mặt trước giấy tờ |
| POST | `/liveness` | một ảnh selfie (heuristic) |

Chi tiết field xem OpenAPI tại `http://127.0.0.1:8000/docs` khi service đang chạy.
