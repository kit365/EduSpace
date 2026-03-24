# booking-service

Booking, deposit hold, PayOS webhook, refund policies (admin).

## Database

Create a PostgreSQL database (dev example):

```sql
CREATE DATABASE eduspace_booking;
```

Set `SPRING_DATASOURCE_URL` (see `application-dev.yml`), e.g.:

`jdbc:postgresql://localhost:5433/eduspace_booking` (default; matches `docker-compose` `booking-db` and `POSTGRES_BOOKING_HOST_PORT` in `EduSpace_BE/.env`)

### Troubleshooting

- **`FATAL: database "eduspace_booking" does not exist`**: Thường do **trỏ nhầm PostgreSQL** (ví dụ cổng **5434** là **room-db**, chỉ có `eduspace_room`). Chạy **`mvn clean compile`** (hoặc Build → Rebuild) để `target/classes` không còn `application-dev.yml` cũ.
- **Cổng host của `booking-db`**: Xem `docker ps` (ví dụ `0.0.0.0:15433->5432/tcp`). IntelliJ **không** đọc `EduSpace_BE/.env` trừ khi bạn cấu hình. Cổng được set trong **`src/main/resources/booking-local.properties`** (`POSTGRES_BOOKING_HOST_PORT`), khớp với `POSTGRES_BOOKING_HOST_PORT` trong `EduSpace_BE/.env` khi dùng Docker Compose.
- **Flyway / schema lệch** (log: version DB > migration trong repo, hoặc `Schema-validation: missing table`): DB có thể còn migration **cũ** (slot/time_slots) khác nhánh hiện tại. Migration **`V4__repair_schema_after_history_drift.sql`** bổ sung cột JPA và bảng deposit/refund. Nếu vẫn lệch nặng, có thể reset volume DB dev (`docker compose down -v` chỉ `booking-db`) rồi chạy lại service để Flyway tạo schema từ đầu.
- **Eureka `Connection refused` tới `localhost:8761`**: Profile **dev** tắt client Eureka mặc định (`eureka.client.enabled=false`). Muốn đăng ký discovery-server, chạy container `discovery-server` và set **`EUREKA_CLIENT_ENABLED=true`** trong Run Configuration.

## PayOS

Set in environment (or `.env` loaded by your run config):

- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`

Register webhook URL (via API Gateway):

`https://<host>/api/v1/payments/payos/webhook`

## API (examples)

- `POST /api/v1/bookings/deposit-intent` — create hold + booking (public)
- `POST /api/v1/bookings/deposit-intent/{id}/payos?returnUrl=` — PayOS checkout URL (public)
- `GET /api/v1/bookings/deposit-intent/{id}/status` — deposit status (public)
- `POST /api/v1/payments/payos/webhook` — PayOS callback (public)
- `GET|POST /api/v1/admin/booking-deposit-refund-policies` — admin CRUD (JWT)
