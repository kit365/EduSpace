-- V14: Canonical roles (GUEST, HOST, MANAGER, …) + permission templates + expanded catalog

INSERT INTO roles (name) VALUES ('MANAGER') ON CONFLICT (name) DO NOTHING;

-- STUDENT -> GUEST (preserve users who only had the legacy name)
INSERT INTO users_roles (user_id, role_id)
SELECT DISTINCT ur.user_id, g.id
FROM users_roles ur
JOIN roles r ON ur.role_id = r.id
CROSS JOIN (SELECT id FROM roles WHERE name = 'GUEST' LIMIT 1) g
WHERE r.name = 'STUDENT'
  AND NOT EXISTS (
    SELECT 1 FROM users_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.role_id = g.id
  );

DELETE FROM users_roles WHERE role_id = (SELECT id FROM roles WHERE name = 'STUDENT');

-- TUTOR -> HOST
INSERT INTO users_roles (user_id, role_id)
SELECT DISTINCT ur.user_id, h.id
FROM users_roles ur
JOIN roles r ON ur.role_id = r.id
CROSS JOIN (SELECT id FROM roles WHERE name = 'HOST' LIMIT 1) h
WHERE r.name = 'TUTOR'
  AND NOT EXISTS (
    SELECT 1 FROM users_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.role_id = h.id
  );

DELETE FROM users_roles WHERE role_id = (SELECT id FROM roles WHERE name = 'TUTOR');

DELETE FROM roles WHERE name IN ('STUDENT', 'TUTOR');

-- MANAGER: same permission subset as ADMIN (see V5)
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN (
    'view_users', 'edit_users', 'create_class', 'approve_content', 'manage_reports',
    'view_revenue', 'view_transactions'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Permission templates (named bundles for role setup)
CREATE TABLE IF NOT EXISTS permission_templates (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP       DEFAULT NOW(),
    updated_at  TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permission_template_permissions (
    template_id     BIGINT      NOT NULL,
    permission_id   BIGINT      NOT NULL,

    PRIMARY KEY (template_id, permission_id),

    CONSTRAINT fk_ptp_template
        FOREIGN KEY (template_id)
        REFERENCES permission_templates (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ptp_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_permission_templates_name ON permission_templates (name);

-- Expanded catalog (aligns with admin sidebar / routes)
INSERT INTO permissions (name, description, group_name) VALUES
('branch.room.view', 'View room list and room details.', 'branch.room'),
('branch.room.create', 'Create new rooms in assigned branch scope.', 'branch.room'),
('branch.room.edit', 'Edit room details.', 'branch.room'),
('branch.room.delete', 'Delete rooms.', 'branch.room'),
('branch.branch.view', 'View branch list and branch details.', 'branch.branch'),
('branch.branch.create', 'Create branches.', 'branch.branch'),
('branch.branch.edit', 'Edit branches.', 'branch.branch'),
('branch.branch.delete', 'Delete branches.', 'branch.branch'),
('branch.finance.export', 'Export finance data.', 'branch.finance'),
('branch.finance.payout.create', 'Create payout requests.', 'branch.finance'),
('view_dashboard', 'View admin dashboard summary.', 'Dashboard'),
('view_messages', 'View support and admin messages.', 'Messages'),
('manage_messages', 'Manage and reply to messages.', 'Messages'),
('view_hosts', 'Browse host accounts and profiles.', 'Host & KYC'),
('approve_hosts', 'Approve host partner applications.', 'Host & KYC'),
('manage_kyc', 'Review and approve user KYC.', 'Host & KYC'),
('view_rooms', 'Browse rooms and listings.', 'Rooms & Catalog'),
('edit_rooms', 'Create and edit room listings.', 'Rooms & Catalog'),
('manage_room_categories', 'Manage room categories.', 'Rooms & Catalog'),
('view_bookings', 'View booking records.', 'Bookings'),
('manage_bookings', 'Modify booking status and details.', 'Bookings'),
('manage_disputes', 'Handle disputes and escalations.', 'Disputes'),
('view_reviews', 'View user reviews.', 'Reviews'),
('moderate_reviews', 'Moderate or remove reviews.', 'Reviews'),
('manage_facilities', 'Manage facility master data.', 'Facilities'),
('manage_points', 'Configure point earning rules.', 'Loyalty'),
('manage_rewards', 'Manage reward catalog.', 'Loyalty'),
('view_settings', 'View system settings.', 'System'),
('edit_settings', 'Change system settings.', 'System'),
('view_logs', 'View system and audit logs.', 'System')
ON CONFLICT (name) DO NOTHING;
