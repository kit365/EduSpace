import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * True after persisted auth (accessToken, etc.) has been merged from storage into the zustand store.
 * Until then, `accessToken` from the store is still null even when the user is logged in — avoid
 * treating them as guest (getOrCreateGuestId) on first paint.
 */
export function useAuthHydrated(): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            await useAuthStore.persist.rehydrate();
            if (!cancelled) setReady(true);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return ready;
}
