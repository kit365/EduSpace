-- Booking theo khoảng start_datetime / end_datetime — không còn bảng slot cố định.
ALTER TABLE IF EXISTS bookings
    DROP COLUMN IF EXISTS slot_id;

DROP TABLE IF EXISTS booking_time_slots CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
