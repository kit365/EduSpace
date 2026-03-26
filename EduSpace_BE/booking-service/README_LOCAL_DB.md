# Booking Service local DB run note

## Cổng PostgreSQL (quan trọng)

- Trong `docker-compose.yml`, `booking-db` map host port **`5433`** → container `5432` (biến `POSTGRES_BOOKING_HOST_PORT`, mặc định 5433).
- `application-dev.yml` dùng cùng mặc định **`5433`** để chạy `booking-service` từ IntelliJ (không cần `.env`).
- Nếu bạn đổi port trong `.env` / compose, đặt `POSTGRES_BOOKING_HOST_PORT` hoặc `SPRING_DATASOURCE_URL` tương ứng trong Run Configuration.

## Run booking-db

From `EduSpace_BE`:

```powershell
docker compose up -d booking-db
docker compose ps booking-db
```

Expected port mapping:

- `0.0.0.0:5433->5432/tcp` (trừ khi bạn override `POSTGRES_BOOKING_HOST_PORT`)

## Run booking-service locally

From `booking-service`:

```powershell
mvn -DskipTests spring-boot:run
```

Optional explicit env in IntelliJ Run Configuration:

- `POSTGRES_BOOKING_HOST_PORT=5433` (hoặc đúng port bạn map cho `booking-db`)
- `SPRING_DATASOURCE_USERNAME=eduspace`
- `SPRING_DATASOURCE_PASSWORD=eduspace_dev_123`

If you use another local DB user/password, set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` accordingly.
