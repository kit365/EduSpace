-- V4: Remove student_id; add host_type, verification_document, verification_status; add GUEST/HOST roles

ALTER TABLE users DROP COLUMN IF EXISTS student_id;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS host_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS verification_document VARCHAR(500),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50);

-- Standard booking roles (GUEST, HOST, ADMIN). ADMIN already exists from V1 seed.
INSERT INTO roles (name) VALUES ('GUEST') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('HOST') ON CONFLICT (name) DO NOTHING;
