ALTER TABLE host_partner_applications 
ADD COLUMN bank_account_number VARCHAR(50),
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN bank_account_holder VARCHAR(100),
ADD COLUMN tax_id VARCHAR(50);
