-- Add new OCR fields to ekyc_verifications table
ALTER TABLE ekyc_verifications ADD COLUMN id_card_number VARCHAR(50);
ALTER TABLE ekyc_verifications ADD COLUMN legal_name VARCHAR(255);
ALTER TABLE ekyc_verifications ADD COLUMN dob DATE;
ALTER TABLE ekyc_verifications ADD COLUMN address VARCHAR(500);
ALTER TABLE ekyc_verifications ADD COLUMN id_card_front_url VARCHAR(255);

-- Create a unique index for verified records to enforce "One account per identity"
-- This ensures that no two accounts can be VERIFIED with the same ID card number.
CREATE UNIQUE INDEX idx_ekyc_unique_verified_id ON ekyc_verifications (id_card_number) WHERE status = 'VERIFIED';
