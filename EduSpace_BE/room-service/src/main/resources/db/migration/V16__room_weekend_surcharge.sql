ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS weekend_surcharge_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS weekend_surcharge_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS weekend_apply_saturday BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS weekend_apply_sunday BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE rooms
    ADD CONSTRAINT ck_rooms_weekend_surcharge_percent_non_negative
        CHECK (weekend_surcharge_percent >= 0);
