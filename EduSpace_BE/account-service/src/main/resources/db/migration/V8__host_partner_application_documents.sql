ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS document_front_url TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS document_back_url TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS business_license_url TEXT;
