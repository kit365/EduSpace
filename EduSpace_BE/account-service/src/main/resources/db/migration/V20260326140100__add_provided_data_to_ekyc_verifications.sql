ALTER TABLE ekyc_verifications
ADD COLUMN provided_name VARCHAR(255),
ADD COLUMN provided_dob VARCHAR(32),
ADD COLUMN provided_phone VARCHAR(32),
ADD COLUMN provided_address VARCHAR(500);
