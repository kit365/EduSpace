-- Fix missing columns in ekyc_verifications table if they were somehow skipped
-- We use a DO block for PostgreSQL to ensure columns are added only if they don't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ekyc_verifications' AND column_name='id_card_number') THEN
        ALTER TABLE ekyc_verifications ADD COLUMN id_card_number VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ekyc_verifications' AND column_name='legal_name') THEN
        ALTER TABLE ekyc_verifications ADD COLUMN legal_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ekyc_verifications' AND column_name='dob') THEN
        ALTER TABLE ekyc_verifications ADD COLUMN dob DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ekyc_verifications' AND column_name='address') THEN
        ALTER TABLE ekyc_verifications ADD COLUMN address VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ekyc_verifications' AND column_name='id_card_front_url') THEN
        ALTER TABLE ekyc_verifications ADD COLUMN id_card_front_url VARCHAR(255);
    END IF;
END $$;
