import { hostPermissions, hostMenuPermissions } from '@/client/features/host/permissions/hostPermissions';
import { legacyPermissionAliases } from '@/utils/keycloakTokenRoles';

function normalizeKey(k: string): string {
    return k.trim().toLowerCase();
}

// Canonical keys: chỉ lấy các permission mà Host UI thật sự dùng để:
// - render menu (sidebar)
// - đi vào các route có PermissionGate
// - hoặc kiểm tra hành vi ngay trong component host
//
// Lý do: `hostPermissions` có thể chứa nhiều quyền “RBAC/admin” hoặc quyền vận hành chưa có màn hình host tương ứng.
// Nếu lấy quá rộng, admin role detail sẽ hiển thị các quyền làm host không thấy gì => gây nhầm lẫn.
const usedHostPermissionKeys = [
    // Sidebar / route gates
    hostMenuPermissions.dashboard,
    hostMenuPermissions.spaces,
    hostMenuPermissions.branches,
    hostMenuPermissions.roomStatus,
    hostMenuPermissions.schedule,
    hostMenuPermissions.calendar,
    hostMenuPermissions.checkout,
    hostMenuPermissions.staff,
    hostMenuPermissions.finance,
    hostMenuPermissions.messages,
    hostMenuPermissions.ads,
    hostMenuPermissions.kyc,

    // Page-level checks (hasHostPermission in host pages)
    hostPermissions.room.view,
    hostPermissions.room.create,
    hostPermissions.room.edit,
    hostPermissions.room.delete,

    hostPermissions.branch.view,
    hostPermissions.branch.create,
    hostPermissions.branch.edit,
    hostPermissions.branch.delete,

    hostPermissions.staff.view,
    hostPermissions.staff.create,
    hostPermissions.staff.edit,
    hostPermissions.staff.delete,

    hostPermissions.finance.view,
    hostPermissions.finance.export,
    hostPermissions.finance.payoutCreate,

    hostPermissions.messages.manage,

    hostPermissions.ads.manage,
];

export const partnerPortalPermissionKeysCanonical = new Set(
    usedHostPermissionKeys.map(normalizeKey).filter(Boolean),
);

// Legacy keys: key “cũ” mà admin DB vẫn có thể gán (view_bookings/manage_bookings, ...).
const legacyKeys = Object.keys(legacyPermissionAliases);
export const partnerPortalPermissionKeysLegacy = new Set(legacyKeys.map(normalizeKey));

export const partnerPortalPermissionKeysAll = new Set([
    ...Array.from(partnerPortalPermissionKeysCanonical),
    ...Array.from(partnerPortalPermissionKeysLegacy),
]);

