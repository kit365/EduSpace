-- =============================================
-- V1: Initialize Database Schema (Consolidated)
-- =============================================

-- Roles table
CREATE TABLE roles (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE
);

-- Users table
CREATE TABLE users (
    user_id             VARCHAR(36)     PRIMARY KEY,
    keycloak_id         VARCHAR(255)    UNIQUE NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    full_name           VARCHAR(255)    NOT NULL,
    phone_number        VARCHAR(20),
    avatar_url          VARCHAR(500),
    student_id          VARCHAR(50),
    is_active           BOOLEAN         DEFAULT TRUE,
    is_email_verified   BOOLEAN         DEFAULT FALSE,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

-- Join table: Users <-> Roles (Many-to-Many)
CREATE TABLE users_roles (
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
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_is_active ON users (is_active);
CREATE INDEX idx_roles_name ON roles (name);
CREATE INDEX idx_users_keycloak_id ON users (keycloak_id);

-- =============================================
-- Seed Data
-- =============================================

-- 1. Default Roles
INSERT INTO roles (name) VALUES ('STUDENT');
INSERT INTO roles (name) VALUES ('TUTOR');
INSERT INTO roles (name) VALUES ('ADMIN');

-- 2. Init Default Admin Account
-- This inserts a mock admin record in our local DB. In a real system,
-- you'd also need the Keycloak counterpart. This assigns a dummy keycloak_id.
INSERT INTO users (user_id, keycloak_id, email, full_name, is_active, is_email_verified)
VALUES ('admin-uuid-0000', 'admin-keycloak-id-0000', 'admin@eduspace.vn', 'System Admin', TRUE, TRUE);

-- Link Admin user to ADMIN role
INSERT INTO users_roles (user_id, role_id)
SELECT 'admin-uuid-0000', id FROM roles WHERE name = 'ADMIN';
