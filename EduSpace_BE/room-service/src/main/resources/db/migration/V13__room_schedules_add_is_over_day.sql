-- Mỗi ngày có thể bật "slot cả ngày" độc lập.
ALTER TABLE room_schedules
    ADD COLUMN IF NOT EXISTS is_over_day BOOLEAN NOT NULL DEFAULT FALSE;
