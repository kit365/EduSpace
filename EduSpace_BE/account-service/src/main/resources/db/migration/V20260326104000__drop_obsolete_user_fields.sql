-- Drop obsolete fields from users table after migration to eKYC entities
ALTER TABLE users DROP COLUMN verification_document;
