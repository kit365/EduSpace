-- Deposit-only bookings (PayOS) may be created before a room slot is assigned.
ALTER TABLE bookings ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN check_in_date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN check_out_date DROP NOT NULL;
