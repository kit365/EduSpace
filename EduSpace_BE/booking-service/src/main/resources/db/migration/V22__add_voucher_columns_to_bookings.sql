ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS voucher_code    VARCHAR(50),
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS final_price     NUMERIC(12, 2);
