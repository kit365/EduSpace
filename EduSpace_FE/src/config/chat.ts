import { jwtDecode } from 'jwt-decode';
import { getOrCreateGuestId } from '../utils/guest';

/**
 * Conversation `user1_id` / `user2_id` in DB must be:
 * - Keycloak JWT `sub` (UUID string) for logged-in users — NOT email.
 * - `GUEST-...` for anonymous.
 * Storing email breaks matching, history, and admin inbox.
 */

/** Must match backend: ChatServiceImpl effective admin placeholder checks */
export const SUPPORT_PLACEHOLDER_USER_ID = 'admin-keycloak-id-0000';

/** Legacy placeholder still accepted by BE fetchProfileSafe — treat as support slot */
export function isSupportPlaceholderUserId(userId: string | null | undefined): boolean {
    if (!userId) return false;
    return userId === SUPPORT_PLACEHOLDER_USER_ID || userId === 'admin-support';
}

function stripBearer(accessToken: string): string {
    return accessToken.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Manual JWT payload decode (UTF-8 safe). Used when `jwtDecode` throws (edge payloads).
 */
function decodeJwtPayloadJson(accessToken: string): Record<string, unknown> | null {
    const raw = stripBearer(accessToken);
    const parts = raw.split('.');
    if (parts.length < 2 || !parts[1]) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    if (padLen) base64 += '='.repeat(padLen);
    try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const text = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(text) as Record<string, unknown>;
    } catch (e) {
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('[chat] manual JWT payload decode failed', e);
        }
        return null;
    }
}

function readSub(payload: Record<string, unknown>): string | null {
    const sub = payload.sub;
    if (typeof sub === 'string' && sub.length > 0) return sub;
    if (typeof sub === 'number' && Number.isFinite(sub)) return String(sub);
    return null;
}

/**
 * Keycloak `sub` when present on the access token; otherwise `null` (many Keycloak access tokens omit
 * `sub` while still including `email` / `sid`). Use {@link useResolvedChatUserId} or GET `/accounts/me`
 * → `keycloakId`. No guest fallback — use when topic must match server broadcast user id.
 */
export function getKeycloakSubFromAccessToken(accessToken: string | null | undefined): string | null {
    if (!accessToken) return null;
    const raw = stripBearer(accessToken);
    if (!raw) return null;

    let payload: Record<string, unknown> | null = null;
    try {
        payload = jwtDecode<Record<string, unknown>>(raw);
    } catch (e) {
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('[chat] jwtDecode failed; trying manual decode', e);
        }
        payload = decodeJwtPayloadJson(accessToken);
    }

    if (!payload) {
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('[chat] JWT payload could not be decoded');
        }
        return null;
    }

    return readSub(payload);
}

/** JWT sub when logged in; stable guest id when anonymous (for WS + bubble alignment). */
export function getCurrentChatUserId(accessToken: string | null): string {
    if (!accessToken) return getOrCreateGuestId();
    const sub = getKeycloakSubFromAccessToken(accessToken);
    if (sub) return sub;
    // Bearer present but no `sub` in token (common for Keycloak access tokens) — do not mint GUEST-*.
    // Callers that need a user id should use `useResolvedChatUserId` (GET /me → keycloakId).
    return '';
}

/**
 * Use after {@link useAuthHydrated} is true. Before hydration, returns null so callers do not
 * mint a GUEST id while the session token is still loading from persist.
 */
export function getChatUserIdForUi(accessToken: string | null, authHydrated: boolean): string | null {
    if (!authHydrated) return null;
    const id = getCurrentChatUserId(accessToken);
    return id.length > 0 ? id : null;
}
