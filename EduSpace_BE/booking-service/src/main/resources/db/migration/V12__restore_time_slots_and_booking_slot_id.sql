-- Khôi phục bảng/cột slot sau V4 (lịch sử DB). V13 loại bỏ lại; ứng dụng đặt theo start_datetime / end_datetime.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS slot_id BIGINT;

CREATE TABLE IF NOT EXISTS time_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_code VARCHAR(20) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_time_slots (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_time_slots_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_time_slots_time_slot
        FOREIGN KEY (time_slot_id) REFERENCES time_slots (id)
);

CREATE INDEX IF NOT EXISTS idx_booking_time_slots_booking_id
    ON booking_time_slots (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_time_slots_room_date
    ON booking_time_slots (room_id, booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_time_slots_room_date_slot
    ON booking_time_slots (room_id, booking_date, time_slot_id);

INSERT INTO time_slots (slot_code, start_time, end_time)
VALUES
    ('SLOT_08_09', TIME '08:00:00', TIME '09:00:00'),
    ('SLOT_09_10', TIME '09:00:00', TIME '10:00:00'),
    ('SLOT_10_11', TIME '10:00:00', TIME '11:00:00'),
    ('SLOT_11_12', TIME '11:00:00', TIME '12:00:00'),
    ('SLOT_12_13', TIME '12:00:00', TIME '13:00:00'),
    ('SLOT_13_14', TIME '13:00:00', TIME '14:00:00'),
    ('SLOT_14_15', TIME '14:00:00', TIME '15:00:00'),
    ('SLOT_15_16', TIME '15:00:00', TIME '16:00:00'),
    ('SLOT_16_17', TIME '16:00:00', TIME '17:00:00'),
    ('SLOT_17_18', TIME '17:00:00', TIME '18:00:00'),
    ('SLOT_18_19', TIME '18:00:00', TIME '19:00:00'),
    ('SLOT_19_20', TIME '19:00:00', TIME '20:00:00'),
    ('SLOT_20_21', TIME '20:00:00', TIME '21:00:00'),
    ('SLOT_21_22', TIME '21:00:00', TIME '22:00:00')
ON CONFLICT (slot_code) DO NOTHING;
