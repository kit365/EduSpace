import { useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/axios';
import { ACCOUNT_API } from '../config/api/account';
import type { ApiResponse } from '../types';
import type { UserResponse } from '../client/features/customer/profile/types';
import { useAuthStore } from '../stores/authStore';
import { useAuthHydrated } from './useAuthHydrated';
import { getKeycloakSubFromAccessToken } from '../config/chat';
import { getOrCreateGuestId } from '../utils/guest';

/**
 * Resolves the user id used for chat REST + WebSocket (`/topic/user/{id}/conversations`).
 * Prefer JWT `sub` via {@link getKeycloakSubFromAccessToken}; if missing, one GET `/accounts/me`
 * provides `keycloakId` from the backend (same value as `sub` when the session is valid).
 */
export function useResolvedChatUserId(): { chatUserId: string | null; identityReady: boolean } {
    const authHydrated = useAuthHydrated();
    const accessToken = useAuthStore((s) => s.accessToken);
    const jwtSub = useMemo(
        () => (accessToken ? getKeycloakSubFromAccessToken(accessToken) : null),
        [accessToken],
    );
    /** `undefined` = not yet fetched; `string | null` = result */
    const [meKeycloakId, setMeKeycloakId] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        if (!authHydrated) return;
        if (!accessToken || jwtSub) {
            setMeKeycloakId(undefined);
            return;
        }
        let cancelled = false;
        void (async () => {
            try {
                const res = await apiClient.get<unknown, ApiResponse<UserResponse>>(ACCOUNT_API.ME);
                const kid = res.data?.keycloakId;
                if (cancelled) return;
                setMeKeycloakId(typeof kid === 'string' && kid.length > 0 ? kid : null);
            } catch {
                if (!cancelled) setMeKeycloakId(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authHydrated, accessToken, jwtSub]);

    if (!authHydrated) {
        return { chatUserId: null, identityReady: false };
    }
    if (!accessToken) {
        return { chatUserId: getOrCreateGuestId(), identityReady: true };
    }
    if (jwtSub) {
        return { chatUserId: jwtSub, identityReady: true };
    }
    if (meKeycloakId === undefined) {
        return { chatUserId: null, identityReady: false };
    }
    return { chatUserId: meKeycloakId, identityReady: true };
}
