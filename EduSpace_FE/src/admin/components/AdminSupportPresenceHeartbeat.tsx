import { useEffect, useRef } from 'react';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { canAccessAdminPortal, getRealmRolesFromAccessToken, isTokenExpired } from '../../utils/keycloakTokenRoles';
import { ACCOUNT_API } from '../../config/api/account';

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Keeps support staff marked as “online” in Redis while an admin/super-admin uses the portal.
 */
export function AdminSupportPresenceHeartbeat() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const roles = getRealmRolesFromAccessToken(accessToken);
        if (!accessToken || isTokenExpired(accessToken) || !canAccessAdminPortal(roles)) {
            return;
        }

        const ping = () => {
            if (isTokenExpired(accessToken)) return;
            
            apiClient.post(ACCOUNT_API.ME_SUPPORT_PRESENCE, {}).catch((err) => {
                // If we get 401, token is definitely no longer valid
                if (err?.response?.status === 401) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            });
        };

        ping();
        intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [accessToken]);

    return null;
}
