import { hasHostPermission } from '@/utils/keycloakTokenRoles';

/** Quyền catalog (account-service) dành cho luồng khách — tách khỏi `manage_bookings` / `manage_messages` của host. */
export const guestPermissions = {
    manageOwnBookings: 'manage_own_bookings',
    guestSendMessages: 'guest_send_messages',
    createReviews: 'create_reviews',
} as const;

export function hasGuestAppPermission(
    token: string | null | undefined,
    perm: (typeof guestPermissions)[keyof typeof guestPermissions],
    permissionsFromAccount?: string[] | null,
): boolean {
    return hasHostPermission(token, perm, permissionsFromAccount);
}

/**
 * Cho phép thao tác khi chưa tải danh sách quyền từ GET /me (tránh chặn nhầm),
 * hoặc khi user có đủ quyền trong DB.
 */
export function guestFeatureAllowed(
    token: string | null | undefined,
    perm: (typeof guestPermissions)[keyof typeof guestPermissions],
    permissionsFromAccount?: string[] | null,
): boolean {
    const list = permissionsFromAccount ?? [];
    if (list.length === 0) return true;
    return hasGuestAppPermission(token, perm, permissionsFromAccount);
}
