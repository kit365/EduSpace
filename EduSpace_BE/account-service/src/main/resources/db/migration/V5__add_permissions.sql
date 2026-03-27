-- =============================================
-- V5: Add Permissions and Role-Permission Mapping
-- =============================================

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    description VARCHAR(255),
    group_name  VARCHAR(100)    NOT NULL -- e.g., 'User Management', 'Content Management'
);

-- Join table: Roles <-> Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS roles_permissions (
    role_id     BIGINT          NOT NULL,
    permission_id BIGINT        NOT NULL,

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_roles_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_roles_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE
);

-- Seed Permissions
INSERT INTO permissions (name, description, group_name) VALUES 
('view_users', 'Ability to browse and search the user list.', 'User Management'),
('edit_users', 'Update user profiles and change account status.', 'User Management'),
('manage_roles', 'Create and edit system roles and their permissions.', 'User Management'),
('delete_users', 'Permanently remove user accounts from the system.', 'User Management'),
('create_class', 'Set up new educational environments.', 'Content & Classrooms'),
('approve_content', 'Review and publish tutor-generated materials.', 'Content & Classrooms'),
('manage_reports', 'Handle user-generated flags and reports.', 'Content & Classrooms'),
('view_revenue', 'Access financial dashboard and reports.', 'Finance & Payouts'),
('manage_payouts', 'Approve and process tutor withdrawal requests.', 'Finance & Payouts'),
('view_transactions', 'Audit all platform financial activity.', 'Finance & Payouts')
ON CONFLICT (name) DO NOTHING;

-- Map Permissions to SUPER_ADMIN
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Map Permissions to ADMIN (subset)
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.name IN ('view_users', 'edit_users', 'create_class', 'approve_content', 'manage_reports', 'view_revenue', 'view_transactions')
ON CONFLICT (role_id, permission_id) DO NOTHING;
