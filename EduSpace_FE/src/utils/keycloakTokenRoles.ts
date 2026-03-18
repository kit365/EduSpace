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

export function normalizeRoleName(r: string): string {
    return r.toUpperCase().replace(/^ROLE_/, '');
}

/** Host console: đã là đối tác (TUTOR) hoặc admin */
export function canAccessHostConsole(roles: string[]): boolean {
    const n = roles.map(normalizeRoleName);
    return n.some((r) => ['TUTOR', 'ADMIN', 'SUPER_ADMIN'].includes(r));
}

export function canAccessAdminPortal(roles: string[]): boolean {
    const n = roles.map(normalizeRoleName);
    return n.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
}
