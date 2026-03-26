ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS min_duration INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN IF NOT EXISTS step_unit INTEGER NOT NULL DEFAULT 30;

ALTER TABLE rooms
    ADD CONSTRAINT ck_rooms_min_duration_positive CHECK (min_duration > 0);

ALTER TABLE rooms
    ADD CONSTRAINT ck_rooms_step_unit_positive CHECK (step_unit > 0);

ALTER TABLE rooms
    ADD CONSTRAINT ck_rooms_min_duration_step_unit_multiple CHECK (mod(min_duration, step_unit) = 0);

CREATE TABLE IF NOT EXISTS room_price_rule (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    min_hours INTEGER NOT NULL,
    max_hours INTEGER,
    price_per_hour DECIMAL(15, 2),
    flat_price DECIMAL(15, 2),
    priority INTEGER NOT NULL DEFAULT 100,
    label VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT ck_room_price_rule_min_hours_positive CHECK (min_hours > 0),
    CONSTRAINT ck_room_price_rule_max_hours_gte_min CHECK (max_hours IS NULL OR max_hours >= min_hours),
    CONSTRAINT ck_room_price_rule_price_source CHECK (price_per_hour IS NOT NULL OR flat_price IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_room_price_rule_room_id ON room_price_rule (room_id);
CREATE INDEX IF NOT EXISTS idx_room_price_rule_priority ON room_price_rule (priority);
