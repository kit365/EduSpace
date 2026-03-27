-- Email liên hệ/xác nhận đặt phòng (bắt buộc cho booking mới).
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

UPDATE bookings
SET guest_email = 'legacy@eduspace.local'
WHERE guest_email IS NULL OR TRIM(guest_email) = '';

ALTER TABLE bookings
    ALTER COLUMN guest_email SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings (guest_email);
