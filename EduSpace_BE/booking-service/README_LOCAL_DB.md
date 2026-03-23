# Booking Service local DB run note

## Why auth failed before

`booking-service` was connecting to `localhost:5433`, but that port can conflict with another local PostgreSQL instance on the host machine.

## Stable local setup

- Docker `booking-db` host port is mapped to `15433` by default in `docker-compose.yml`.
- `booking-service` dev datasource fallback uses `POSTGRES_BOOKING_HOST_PORT:15433`.

## Run booking-db

From `EduSpace_BE`:

```powershell
docker compose up -d booking-db
docker compose ps booking-db
```

Expected port mapping:

- `0.0.0.0:15433->5432/tcp`

## Run booking-service locally

From `booking-service`:

```powershell
mvn -DskipTests spring-boot:run
```

Optional explicit env in IntelliJ Run Configuration:

- `POSTGRES_BOOKING_HOST_PORT=15433`
- `SPRING_DATASOURCE_USERNAME=eduspace`
- `SPRING_DATASOURCE_PASSWORD=eduspace_dev_123`

If you use another local DB user/password, set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` accordingly.
