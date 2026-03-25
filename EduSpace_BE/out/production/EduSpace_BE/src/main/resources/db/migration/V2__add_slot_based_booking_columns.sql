ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS slot_id BIGINT,
    ADD COLUMN IF NOT EXISTS booking_date DATE,
    ADD COLUMN IF NOT EXISTS duration_value INTEGER,
    ADD COLUMN IF NOT EXISTS duration_unit VARCHAR(20),
    ADD COLUMN IF NOT EXISTS start_datetime TIMESTAMP,
    ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMP,
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(15, 2);

CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings (room_id, booking_date);
