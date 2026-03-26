import { hostPermissions } from '@/client/features/host/permissions/hostPermissions';
import { useAuthStore } from '@/stores/authStore';

/** Lấy realm roles từ access token Keycloak (không verify chữ ký — chỉ dùng cho UI). */
export function getRealmRolesFromAccessToken(token: string | null | undefined): string[] {
    if (!token || typeof token !== 'string') return [];
    try {
        const part = token.split('.')[1];
        if (!part) return [];
        let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const json = atob(b64);
        const payload = JSON.parse(json) as { realm_access?: { roles?: string[] } };
        return payload.realm_access?.roles ?? [];
    } catch {
        return [];
    }
}

export function isTokenExpired(token: string | null | undefined): boolean {
    if (!token) return true;
    try {
        const part = token.split('.')[1];
        if (!part) return true;
        const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
        if (!payload.exp) return false;
        return (payload.exp * 1000) < Date.now();
    } catch {
        return true;
    }
}

type TokenPayload = {
    realm_access?: { roles?: string[] };
    permissions?: string[];
    authorities?: string[];
    scope?: string;
};

function decodePayload(token: string | null | undefined): TokenPayload | null {
    if (!token || typeof token !== 'string') return null;
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const json = atob(b64);
        return JSON.parse(json) as TokenPayload;
    } catch {
        return null;
    }
}

export function getPermissionsFromAccessToken(token: string | null | undefined): string[] {
    const payload = decodePayload(token);
    if (!payload) return [];
    const fromPermissions = payload.permissions ?? [];
    const fromAuthorities = payload.authorities ?? [];
    const fromScope = (payload.scope ?? '')
        .split(' ')
        .map((s) => s.trim())
        .filter(Boolean);
    return Array.from(new Set([...fromPermissions, ...fromAuthorities, ...fromScope]))
        .filter(Boolean)
        .map(normalizePermissionName);
}
export function normalizeRoleName(r: string): string {
    return r.toUpperCase().replace(/^ROLE_/, '');
}

/** Host console (/rental): Host, Manager, operational STAFF, hoặc admin */
export function canAccessHostConsole(roles: string[]): boolean {
    const n = roles.map(normalizeRoleName);
    return n.some((r) => ['HOST', 'MANAGER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(r));
}

export function canAccessAdminPortal(roles: string[]): boolean {
    const n = roles.map(normalizeRoleName);
    return n.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
}

// `hostPermissions` có thể thay đổi theo module/template, và trong một số phiên bản
// có thể thiếu một số nhánh (ví dụ `rbacTemplate`). Cast `any` giúp tránh lỗi compile.
const hp = hostPermissions as any;

const defaultHostPermissionsByRole: Record<string, string[]> = {
    HOST: [
        hp?.room?.view,
        hp?.room?.create,
        hp?.room?.edit,
        hp?.room?.delete,
        hp?.branch?.view,
        hp?.branch?.create,
        hp?.branch?.edit,
        hp?.branch?.delete,
        hp?.finance?.view,
        hp?.finance?.manage,
        hp?.finance?.export,
        hp?.finance?.payoutCreate,
        hp?.rbacTemplate?.view,
        hp?.rbacTemplate?.manage,
        hp?.operations?.checkin,
        hp?.operations?.checkout,
        hp?.operations?.roomStatus,
        'branch.maintenance.manage',
        'branch.cleaning.manage',
        'branch.booking.view',
        'branch.booking.manage',
        'branch.profile.view',
        'branch.profile.manage',
        'branch.staff.view',
        'branch.staff.create',
        'branch.staff.edit',
        'branch.staff.delete',
        'rbac.permission.view',
        'rbac.permission.manage',
        'rbac.role.assign',
    ].filter((p): p is string => typeof p === 'string' && p.length > 0),
    MANAGER: [
        hp?.room?.view,
        hp?.branch?.view,
        hp?.finance?.view,
        hp?.finance?.export,
        hp?.rbacTemplate?.view,
        hp?.operations?.checkin,
        hp?.operations?.checkout,
        hp?.operations?.roomStatus,
        'branch.maintenance.manage',
        'branch.cleaning.manage',
        'branch.booking.view',
        'branch.booking.manage',
        'branch.profile.view',
        'branch.staff.view',
        'rbac.permission.view',
    ].filter((p): p is string => typeof p === 'string' && p.length > 0),
    /** Real grants come from GET /accounts/me (user_permissions + role). */
    STAFF: [],
    ADMIN: ['*'],
    SUPER_ADMIN: ['*'],
};

export const legacyPermissionAliases: Record<string, string[]> = {
    view_rooms: [hp?.room?.view].filter((p): p is string => typeof p === 'string' && p.length > 0),
    edit_rooms: [hp?.room?.create, hp?.room?.edit].filter((p): p is string => typeof p === 'string' && p.length > 0),
    manage_rooms: [hp?.room?.create, hp?.room?.edit, hp?.room?.delete].filter(
        (p): p is string => typeof p === 'string' && p.length > 0,
    ),
    view_revenue: [hp?.finance?.view].filter((p): p is string => typeof p === 'string' && p.length > 0),
    // Booking permissions (legacy names in DB templates/admin UI)
    view_bookings: ['branch.booking.view'],
    manage_bookings: ['branch.booking.manage'],
    'view-bookings': ['branch.booking.view'],
    'manage-bookings': ['branch.booking.manage'],
    // Dashboard / finance / KYC legacy names
    // Decouple legacy dashboard permission from booking/calendar keys.
    // Keep only `view_dashboard` itself; callers that need booking/calendar should rely on
    // `branch.booking.view` permissions separately.
    view_dashboard: [],
    view_transactions: [hp?.finance?.view].filter((p): p is string => typeof p === 'string' && p.length > 0),
    manage_reports: [hp?.finance?.manage].filter((p): p is string => typeof p === 'string' && p.length > 0),
    manage_kyc: ['branch.profile.manage'],
    'manage-kyc': ['branch.profile.manage'],
};

const roleFallbackEnabled =
    String(import.meta.env.VITE_RBAC_ROLE_FALLBACK ?? '')
        .trim()
        .toLowerCase() === 'true';

function normalizePermissionName(permission: string): string {
    return permission.trim().toLowerCase();
}

function expandLegacyPermissions(permission: string): string[] {
    const normalized = normalizePermissionName(permission);
    return [normalized, ...(legacyPermissionAliases[normalized] ?? [])];
}

export function resolveHostPermissions(
    token: string | null | undefined,
    hostPermissionsFromAccount?: string[] | null,
): Set<string> {
    const explicitPermissions = getPermissionsFromAccessToken(token);
    const accountPermissions = hostPermissionsFromAccount ?? useAuthStore.getState().hostPermissionsFromAccount;

    const mergedRaw = [
        ...explicitPermissions,
        ...(Array.isArray(accountPermissions) ? accountPermissions : []),
    ].filter(Boolean);

    if (mergedRaw.length > 0) {
        const expanded = new Set<string>();
        mergedRaw.forEach((permission) => {
            expandLegacyPermissions(permission).forEach((resolved) => expanded.add(resolved));
        });
        return expanded;
    }

    // Transition mode only: keep role fallback when explicitly enabled via env flag.
    if (!roleFallbackEnabled) return new Set<string>();

    const roles = getRealmRolesFromAccessToken(token).map(normalizeRoleName);
    const merged = new Set<string>();
    for (const role of roles) {
        (defaultHostPermissionsByRole[role] ?? []).forEach((permission) => merged.add(permission));
    }
    return merged;
}

export function hasHostPermission(
    token: string | null | undefined,
    permission: string,
    hostPermissionsFromAccount?: string[] | null,
): boolean {
    const resolved = resolveHostPermissions(token, hostPermissionsFromAccount);
    const key = normalizePermissionName(permission);
    return resolved.has('*') || resolved.has(key);
}
