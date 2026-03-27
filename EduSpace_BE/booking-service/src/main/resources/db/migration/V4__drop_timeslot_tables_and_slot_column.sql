-- Remove legacy fixed-slot model. Booking now uses direct start/end datetime.
ALTER TABLE IF EXISTS bookings
    DROP COLUMN IF EXISTS slot_id;

DROP TABLE IF EXISTS booking_time_slots CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;

