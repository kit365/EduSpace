/**
 * Allowlist quyền hiển thị khi Admin chỉnh vai trò GUEST (người dùng cuối / nền tảng).
 * Không gồm branch.*, rbac.*, System, dashboard admin, v.v.
 */
function normalizeKey(k: string): string {
    return k.trim().toLowerCase();
}

const guestEndUserPermissionKeys = [
    'view_rooms',
    'view_bookings',
    'view_reviews',
    'view_messages',
    'manage_own_bookings',
    'guest_send_messages',
    'create_reviews',
];

export const guestPortalPermissionKeysCanonical = new Set(
    guestEndUserPermissionKeys.map(normalizeKey).filter(Boolean),
);

/** Alias chuỗi (nếu DB/Keycloak còn dùng dạng có dấu gạch). */
const guestExtraAliases = ['view-bookings'];

export const guestPortalPermissionKeysAll = new Set([
    ...Array.from(guestPortalPermissionKeysCanonical),
    ...guestExtraAliases.map(normalizeKey),
]);
