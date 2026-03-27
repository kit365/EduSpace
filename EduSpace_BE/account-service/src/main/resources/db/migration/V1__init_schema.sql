-- =============================================
-- V1: Initialize Database Schema (Consolidated)
-- =============================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id             VARCHAR(36)     PRIMARY KEY,
    keycloak_id         VARCHAR(255)    UNIQUE NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    full_name           VARCHAR(255)    NOT NULL,
    phone_number        VARCHAR(20),
    avatar_url          VARCHAR(500),
    student_id          VARCHAR(50),
    location            VARCHAR(255),
    short_bio           VARCHAR(500),
    city_state          VARCHAR(255),
    district            VARCHAR(255),
    ward                VARCHAR(255),
    street_address      VARCHAR(500),
    postal_code         VARCHAR(20),
    tax_id              VARCHAR(50),
    is_active           BOOLEAN         DEFAULT TRUE,
    is_email_verified   BOOLEAN         DEFAULT FALSE,
    is_2fa_enabled      BOOLEAN         DEFAULT FALSE,
    totp_secret         VARCHAR(255),
    point_balance       INTEGER         DEFAULT 0,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

-- Join table: Users <-> Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS users_roles (
    user_id     VARCHAR(36)     NOT NULL,
    role_id     BIGINT          NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_users_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_users_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name);
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users (keycloak_id);

-- =============================================
-- Seed Data
-- =============================================

-- 1. Default Roles
INSERT INTO roles (name) VALUES ('STUDENT') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('TUTOR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('GUEST') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('HOST') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('SUPER_ADMIN') ON CONFLICT (name) DO NOTHING;

-- 2. Init Default Admin Account
INSERT INTO users (user_id, keycloak_id, email, full_name, is_active, is_email_verified)
VALUES ('super-admin-uuid-0000', 'super-admin-keycloak-id-0000', 'superadmin@eduspace.vn', 'Root Super Admin', TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- Link Super Admin user to SUPER_ADMIN role
INSERT INTO users_roles (user_id, role_id)
SELECT 'super-admin-uuid-0000', id FROM roles WHERE name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM users_roles WHERE user_id = 'super-admin-uuid-0000' AND role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')
);

INSERT INTO users (user_id, keycloak_id, email, full_name, is_active, is_email_verified)
VALUES ('admin-uuid-0000', 'admin-keycloak-id-0000', 'admin@eduspace.vn', 'System Admin', TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- Link Admin user to ADMIN role
INSERT INTO users_roles (user_id, role_id)
SELECT 'admin-uuid-0000', id FROM roles WHERE name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM users_roles WHERE user_id = 'admin-uuid-0000' AND role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
);

-- 3. Specific Admin for User
INSERT INTO users (user_id, keycloak_id, email, full_name, is_active, is_email_verified)
VALUES ('kiet-admin-uuid', 'kiet-admin-keycloak-id', 'kietops365@gmail.com', 'Kiet Super Admin', TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users_roles (user_id, role_id)
SELECT 'kiet-admin-uuid', id FROM roles WHERE name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM users_roles WHERE user_id = 'kiet-admin-uuid' AND role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')
);
