ALTER TABLE ekyc_verifications
ADD COLUMN ocr_name VARCHAR(255),
ADD COLUMN ocr_id_number VARCHAR(64),
ADD COLUMN ocr_dob VARCHAR(32),
ADD COLUMN ocr_address VARCHAR(500);
