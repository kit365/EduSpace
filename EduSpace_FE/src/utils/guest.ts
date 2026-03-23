import { useAuthStore } from '../stores/authStore';

/** Keep in sync with `stores/authStore.ts` (cleared on `setTokens`). */
export const GUEST_ID_KEY = 'eduspace_guest_id';

/** Existing guest id only (no new UUID). Use when Bearer is present but BE may need fallback. */
export const getGuestIdFromStorageIfPresent = (): string | null => {
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    return guestId?.startsWith('GUEST-') ? guestId : null;
};

/**
 * Only for anonymous chat. Never persists or returns a stable guest id while accessToken is set —
 * that caused eduspace_guest_id to stay populated after login.
 */
export const getOrCreateGuestId = (): string => {
    if (useAuthStore.getState().accessToken) {
        localStorage.removeItem(GUEST_ID_KEY);
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[guest] getOrCreateGuestId called while authenticated — caller bug');
        }
        throw new Error('Guest id is not used when logged in');
    }
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = `GUEST-${crypto.randomUUID()}`;
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
};

export const clearGuestId = (): void => {
    localStorage.removeItem(GUEST_ID_KEY);
};
