-- Ensure HOST role always has core host-console permissions.
-- Idempotent fix for environments where HOST role exists but roles_permissions is incomplete.

INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'view_dashboard',
    'branch.room.view',
    'branch.room.create',
    'branch.room.edit',
    'branch.room.delete',
    'branch.branch.view',
    'branch.branch.create',
    'branch.branch.edit',
    'branch.branch.delete',
    'branch.booking.view',
    'branch.booking.manage',
    'branch.checkin.manage',
    'branch.checkout.manage',
    'branch.room_status.manage',
    'branch.maintenance.manage',
    'branch.cleaning.manage',
    'branch.profile.view',
    'branch.profile.manage',
    'branch.staff.view',
    'branch.staff.create',
    'branch.staff.edit',
    'branch.staff.delete',
    'branch.finance.view',
    'branch.finance.manage',
    'branch.finance.export',
    'branch.finance.payout.create',
    'branch.ads.manage',
    'rbac.template.view',
    'rbac.template.manage',
    'rbac.permission.view',
    'rbac.permission.manage',
    'rbac.role.assign',
    'view_messages',
    'manage_messages'
)
WHERE r.name = 'HOST'
ON CONFLICT (role_id, permission_id) DO NOTHING;
