-- =============================================
-- V1: Init schema for room-service
-- Facilities + Rooms (Spaces)
-- =============================================

CREATE TABLE facilities (
    facility_id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    host_id             VARCHAR(36) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    location            VARCHAR(255),
    address             TEXT,
    description         TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft',
    rejection_reason    TEXT,
    submitted_at        TIMESTAMP,
    approved_at         TIMESTAMP,
    approved_by         VARCHAR(36),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_facilities_host_id ON facilities (host_id);
CREATE INDEX idx_facilities_status ON facilities (status);

CREATE TABLE rooms (
    room_id             VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_id         VARCHAR(36) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    type                VARCHAR(50) NOT NULL,
    capacity            INT NOT NULL,
    size_sqm            NUMERIC(6,2),
    price_per_hour      BIGINT NOT NULL,
    cover_image_url     TEXT,
    description         TEXT,
    additional_info     TEXT,
    instant_book        BOOLEAN DEFAULT FALSE,
    approval_status     VARCHAR(30) NOT NULL DEFAULT 'draft',
    rejection_reason    TEXT,
    submitted_at        TIMESTAMP,
    approved_at         TIMESTAMP,
    approved_by         VARCHAR(36),
    avg_rating          NUMERIC(3,2) DEFAULT 0,
    review_count        INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_rooms_facility
        FOREIGN KEY (facility_id)
        REFERENCES facilities (facility_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_rooms_facility_id ON rooms (facility_id);
CREATE INDEX idx_rooms_approval_status ON rooms (approval_status);
CREATE INDEX idx_rooms_type ON rooms (type);

