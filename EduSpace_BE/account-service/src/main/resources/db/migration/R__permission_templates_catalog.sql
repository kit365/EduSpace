-- Repeatable: idempotent copy of template/catalog DDL from V14.
-- Ensures DBs that already ran the older V14 (before merge) get tables + seeds after `flyway repair`.

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
('branch.checkin.manage', 'Manage check-in operations for assigned branch.', 'branch.operations'),
('branch.checkout.manage', 'Manage check-out operations for assigned branch.', 'branch.operations'),
('branch.room_status.manage', 'Update room status, lock/cleanup/maintenance states.', 'branch.operations'),
('branch.maintenance.manage', 'Manage maintenance tickets and repair workflow.', 'branch.operations'),
('branch.cleaning.manage', 'Manage cleaning tasks and room housekeeping workflow.', 'branch.operations'),
('branch.booking.view', 'View booking list and booking details.', 'branch.schedule'),
('branch.booking.manage', 'Update booking status and booking-related operations.', 'branch.schedule'),
('branch.ads.manage', 'Manage advertisements and promotions for the branch.', 'branch.marketing'),
('branch.finance.view', 'View finance reports and branch transactions.', 'branch.finance'),
('branch.finance.manage', 'Manage branch finance settings and sensitive finance operations.', 'branch.finance'),
('view_dashboard', 'View host dashboard summary.', 'Dashboard'),
('view_messages', 'View messages and conversations.', 'Messages'),
('manage_messages', 'Reply and manage messages.', 'Messages'),
('branch.profile.view', 'View branch profile and configuration.', 'branch.settings'),
('branch.profile.manage', 'Manage branch profile and branch configuration.', 'branch.settings'),
('branch.staff.view', 'View staff list and basic details.', 'branch.staff'),
('branch.staff.create', 'Create new staff accounts for the branch.', 'branch.staff'),
('branch.staff.edit', 'Edit staff information and permissions.', 'branch.staff'),
('branch.staff.delete', 'Delete or deactivate staff accounts.', 'branch.staff'),
('rbac.permission.view', 'View permission catalog.', 'rbac'),
('rbac.permission.manage', 'Create and update permission catalog.', 'rbac'),
('rbac.template.view', 'View permission templates.', 'rbac'),
('rbac.template.manage', 'Create, update, delete permission templates.', 'rbac'),
('rbac.role.assign', 'Assign templates/permissions to roles.', 'rbac'),
('view_rooms', 'Browse rooms and listings.', 'Rooms & Catalog'),
('view_bookings', 'View booking records.', 'Bookings'),
('manage_bookings', 'Modify booking status and details.', 'Bookings'),
('view_reviews', 'View user reviews.', 'Reviews'),
('manage_own_bookings', 'Cancel, reschedule, or update own booking requests (guest self-service).', 'Bookings'),
('guest_send_messages', 'Send and reply in guest conversations (not admin broadcast).', 'Messages'),
('create_reviews', 'Create and submit reviews after bookings.', 'Reviews')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permission_templates (name, description) VALUES
('HOST_DEFAULT', 'Default permission bundle for host role.'),
('MANAGER_DEFAULT', 'Default permission bundle for manager role (finance read-only).'),
('GUEST_DEFAULT', 'Default permission bundle for guest (end-user) role.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permission_template_permissions (template_id, permission_id)
SELECT t.id, p.id
FROM permission_templates t
JOIN permissions p ON p.name IN (
  'view_dashboard',
  'view_messages',
  'manage_messages',
  'branch.room.view',
  'branch.room.create',
  'branch.room.edit',
  'branch.room.delete',
  'branch.branch.view',
  'branch.branch.create',
  'branch.branch.edit',
  'branch.branch.delete',
  'branch.checkin.manage',
  'branch.checkout.manage',
  'branch.room_status.manage',
  'branch.maintenance.manage',
  'branch.cleaning.manage',
  'branch.booking.view',
  'branch.booking.manage',
  'branch.ads.manage',
  'branch.finance.view',
  'branch.finance.manage',
  'branch.finance.export',
  'branch.finance.payout.create',
  'branch.profile.view',
  'branch.profile.manage',
  'branch.staff.view',
  'branch.staff.create',
  'branch.staff.edit',
  'branch.staff.delete',
  'rbac.permission.view',
  'rbac.permission.manage',
  'rbac.template.view',
  'rbac.template.manage',
  'rbac.role.assign'
)
WHERE t.name = 'HOST_DEFAULT'
ON CONFLICT (template_id, permission_id) DO NOTHING;

INSERT INTO permission_template_permissions (template_id, permission_id)
SELECT t.id, p.id
FROM permission_templates t
JOIN permissions p ON p.name IN (
  'view_dashboard',
  'view_messages',
  'manage_messages',
  'branch.room.view',
  'branch.branch.view',
  'branch.checkin.manage',
  'branch.checkout.manage',
  'branch.room_status.manage',
  'branch.maintenance.manage',
  'branch.cleaning.manage',
  'branch.booking.view',
  'branch.booking.manage',
  'branch.ads.manage',
  'branch.finance.view',
  'branch.finance.export',
  'branch.profile.view',
  'rbac.permission.view',
  'rbac.template.view'
)
WHERE t.name = 'MANAGER_DEFAULT'
ON CONFLICT (template_id, permission_id) DO NOTHING;

INSERT INTO permission_template_permissions (template_id, permission_id)
SELECT t.id, p.id
FROM permission_templates t
JOIN permissions p ON p.name IN (
  'view_rooms',
  'view_bookings',
  'view_reviews',
  'view_messages',
  'manage_own_bookings',
  'guest_send_messages',
  'create_reviews'
)
WHERE t.name = 'GUEST_DEFAULT'
ON CONFLICT (template_id, permission_id) DO NOTHING;

-- Khách (GUEST) không có quyền thay đổi trạng thái đặt phòng — gỡ khỏi template & role nếu đã seed cũ.
DELETE FROM permission_template_permissions ptp
USING permission_templates t, permissions p
WHERE ptp.template_id = t.id
  AND ptp.permission_id = p.id
  AND t.name = 'GUEST_DEFAULT'
  AND p.name = 'manage_bookings';

DELETE FROM roles_permissions rp
USING roles r, permissions p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND r.name = 'GUEST'
  AND p.name = 'manage_bookings';

-- GUEST: không gán quyền vận hành / kiểm duyệt / chỉnh sửa listing (chỉ hiển thị allowlist FE).
DELETE FROM permission_template_permissions ptp
USING permission_templates t, permissions p
WHERE ptp.template_id = t.id
  AND ptp.permission_id = p.id
  AND t.name = 'GUEST_DEFAULT'
  AND p.name IN ('manage_disputes', 'moderate_reviews', 'manage_messages', 'edit_rooms');

DELETE FROM roles_permissions rp
USING roles r, permissions p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND r.name = 'GUEST'
  AND p.name IN ('manage_disputes', 'moderate_reviews', 'manage_messages', 'edit_rooms');

-- Gán quyền khách (self-service / chat / viết review) cho role GUEST khi đã có trong catalog.
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
  'manage_own_bookings',
  'guest_send_messages',
  'create_reviews'
)
WHERE r.name = 'GUEST'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Backfill existing role assignments from legacy `branch.staff.manage`
-- to the new granular staff permissions.
INSERT INTO roles_permissions (role_id, permission_id)
SELECT DISTINCT rp.role_id, p_new.id
FROM roles_permissions rp
JOIN permissions p_old
  ON p_old.id = rp.permission_id
 AND p_old.name = 'branch.staff.manage'
JOIN permissions p_new
  ON p_new.name IN (
    'branch.staff.view',
    'branch.staff.create',
    'branch.staff.edit',
    'branch.staff.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Host ads: gán branch.ads.manage cho mọi role đã có branch.booking.manage (tách menu Quảng cáo khỏi Lịch & giờ).
INSERT INTO roles_permissions (role_id, permission_id)
SELECT DISTINCT rp.role_id, p_new.id
FROM roles_permissions rp
JOIN permissions p_old
  ON p_old.id = rp.permission_id
 AND p_old.name = 'branch.booking.manage'
JOIN permissions p_new
  ON p_new.name = 'branch.ads.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;
