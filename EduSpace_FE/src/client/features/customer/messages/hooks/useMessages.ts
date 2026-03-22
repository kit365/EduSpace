import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../stores/authStore';
import { messageService } from '../services/messageService';
import type { Conversation } from '../types';

export function useConversations(mode: 'user' | 'admin' | 'host' = 'user') {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const accessToken = useAuthStore((s) => s.accessToken);

    const load = useCallback(async () => {
        if (mode === 'admin') {
            await useAuthStore.persist.rehydrate();
            if (!useAuthStore.getState().accessToken) {
                setConversations([]);
                return;
            }
        }
        const data =
            mode === 'admin'
                ? await messageService.getAdminConversations()
                : await messageService.getConversations();
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.info(`[useConversations:${mode}] loaded`, { count: data.length });
        }
        setConversations(data);
    }, [mode]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                await load();
            } catch (e) {
                console.error('[useConversations]', e);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        setLoading(true);
        void run();
        return () => {
            cancelled = true;
        };
    }, [mode, accessToken, load]);

    const refetch = useCallback(async () => {
        try {
            await load();
        } catch (e) {
            console.error('[useConversations] refetch', e);
        }
    }, [load]);

    return { conversations, loading, setConversations, refetch };
}
