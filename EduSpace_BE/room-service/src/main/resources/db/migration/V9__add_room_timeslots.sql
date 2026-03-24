CREATE TABLE room_timeslots (
    id BIGSERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    slot_type VARCHAR(20) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 2 AND day_of_week <= 8),
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    duration_mode VARCHAR(20) NOT NULL,
    duration_step INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT ck_room_timeslots_slot_type CHECK (slot_type IN ('DAY', 'SESSION')),
    CONSTRAINT ck_room_timeslots_duration_mode CHECK (duration_mode IN ('MINUTE', 'HOUR')),
    CONSTRAINT ck_room_timeslots_duration_step CHECK (duration_step > 0),
    CONSTRAINT ck_room_timeslots_time_range CHECK (start_time < end_time)
);

CREATE UNIQUE INDEX uq_room_timeslots_room_day_time_type
    ON room_timeslots (room_id, day_of_week, start_time, end_time, slot_type);

CREATE INDEX idx_room_timeslots_room_day
    ON room_timeslots (room_id, day_of_week);
