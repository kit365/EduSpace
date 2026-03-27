import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useChatWebSocket } from '../../client/features/customer/messages/hooks/useChatWebSocket';
import { messageService } from '../../client/features/customer/messages/services/messageService';
import { SUPPORT_PLACEHOLDER_USER_ID } from '../../config/chat';
import { useResolvedChatUserId } from '../../hooks/useResolvedChatUserId';
import { useAuthStore } from '../../stores/authStore';
import { useChatInboxStore } from '../../stores/chatInboxStore';
import { canAccessAdminPortal, getRealmRolesFromAccessToken } from '../../utils/keycloakTokenRoles';
import type { AssignmentOfferEvent, ConversationActivityEvent } from '../../client/features/customer/messages/types';

const REFRESH_DEBOUNCE_MS = 450;
const TOAST_DEDUPE_MS = 2500;

function sumUnread(conversations: { unreadCount?: number }[]): number {
    return conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
}

/**
 * Global STOMP inbox: publishes {@link useChatInboxStore} `lastInboxEvent`, toasts, and unread totals.
 * Mount once under the app shell (e.g. RootLayout). Message pages use `subscribeInbox: false` on `useChatWebSocket`.
 */
export function ChatInboxNotificationBridge() {
    const { pathname } = useLocation();
    const accessToken = useAuthStore((s) => s.accessToken);
    const { chatUserId, identityReady } = useResolvedChatUserId();

    const realmRoles = useMemo(() => getRealmRolesFromAccessToken(accessToken), [accessToken]);
    const canAdmin = canAccessAdminPortal(realmRoles);
    const isAdminRoute = pathname.startsWith('/admin');
    const extraInboxUserIds = useMemo(() => {
        if (isAdminRoute && canAdmin) {
            return [SUPPORT_PLACEHOLDER_USER_ID] as const;
        }
        return [] as const;
    }, [isAdminRoute, canAdmin]);

    const setLastInboxEvent = useChatInboxStore((s) => s.setLastInboxEvent);
    const setTotalUnreadCount = useChatInboxStore((s) => s.setTotalUnreadCount);
    const setAdminTotalUnread = useChatInboxStore((s) => s.setAdminTotalUnread);
    const setPendingAssignmentOffer = useChatInboxStore((s) => s.setPendingAssignmentOffer);

    const { lastConversationEvent } = useChatWebSocket({
        conversationId: null,
        userId: chatUserId,
        extraInboxUserIds,
        subscribeInbox: true,
        enabled: identityReady,
    });

    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastToastAtRef = useRef<Record<string, number>>({});

    const refreshCounts = useCallback(async () => {
        if (!identityReady) return;
        try {
            if (isAdminRoute && canAdmin) {
                const convs = await messageService.getAdminConversations();
                setAdminTotalUnread(sumUnread(convs));
            } else {
                const convs = await messageService.getConversations();
                setTotalUnreadCount(sumUnread(convs));
            }
        } catch {
            /* ignore */
        }
    }, [isAdminRoute, canAdmin, identityReady, setAdminTotalUnread, setTotalUnreadCount]);

    const scheduleRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = setTimeout(() => {
            refreshTimerRef.current = null;
            void refreshCounts();
        }, REFRESH_DEBOUNCE_MS);
    }, [refreshCounts]);

    useEffect(() => {
        if (!identityReady) return;
        void refreshCounts();
    }, [refreshCounts, pathname, accessToken, identityReady]);

    useEffect(() => {
        if (!lastConversationEvent) return;

        setLastInboxEvent(lastConversationEvent);
        scheduleRefresh();

        const onAnyMessagesScreen =
            pathname === '/messages' ||
            pathname.startsWith('/rental/messages') ||
            pathname.startsWith('/admin/messages');

        if (lastConversationEvent.type === 'ASSIGNMENT_OFFER') {
            if (!canAdmin) return;
            const offer = lastConversationEvent as AssignmentOfferEvent;
            setPendingAssignmentOffer(offer);
            toast.info('Support assignment request', {
                description: 'Open Messages to accept or wait for expiry.',
            });
            return;
        }

        const act = lastConversationEvent as ConversationActivityEvent;
        if (act.senderId && chatUserId && act.senderId === chatUserId) {
            return;
        }

        if (onAnyMessagesScreen) {
            return;
        }

        const dedupeKey = `ca-${act.conversationId}-${act.lastActivity ?? ''}`;
        const now = Date.now();
        const prev = lastToastAtRef.current[dedupeKey] ?? 0;
        if (now - prev < TOAST_DEDUPE_MS) return;
        lastToastAtRef.current[dedupeKey] = now;

        const preview =
            act.messageType === 'IMAGE'
                ? '[Image]'
                : (act.lastMessage ?? '').trim() || 'New message';
        toast.message('New message', {
            description: preview.length > 80 ? `${preview.slice(0, 80)}…` : preview,
        });
    }, [
        lastConversationEvent,
        setLastInboxEvent,
        scheduleRefresh,
        pathname,
        chatUserId,
        canAdmin,
        setPendingAssignmentOffer,
    ]);

    return null;
}
