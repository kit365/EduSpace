-- V7: Repair drifted properties schema for Hibernate validation
-- Some local DBs were migrated partially and can miss columns added in V4.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS province_code VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS district_code VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ward_code VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS address_detail VARCHAR(500);

-- Keep legacy 'address' untouched if it exists; app now reads address_detail.
