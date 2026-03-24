import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../../../stores/authStore';
import { getKeycloakSubFromAccessToken } from '../../../../../config/chat';
import { getOrCreateGuestId } from '../../../../../utils/guest';
import type {
    ConversationActivityEvent,
    WebSocketDeletedPayload,
    WebSocketEditedPayload,
    WebSocketMessagePayload,
    WebSocketReactionPayload,
    WebSocketReadReceiptPayload,
} from '../types';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
/** SockJS entry (gateway forwards /ws → conversation-service). Port is same as API_BASE_URL (e.g. 8080). */
const WEBSOCKET_URL = API_BASE_URL + '/ws';

function devWsLog(label: string, payload?: unknown) {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info(`[chat WS] ${label}`, payload ?? '');
    }
}

export function useChatWebSocket(params: {
    conversationId: string | null;
    userId: string | null;
    /**
     * Extra `/topic/user/{id}/conversations` subscriptions (e.g. support queue placeholder).
     * BE broadcasts unassigned admin threads to user2 = placeholder id; staff must subscribe there too.
     */
    extraInboxUserIds?: readonly string[];
    /** Called when STOMP reconnects after a disconnect (e.g. elevator / flaky network). Refetch history in parent. */
    onReconnect?: () => void;
}) {
    const { conversationId, userId, extraInboxUserIds = [], onReconnect } = params;
    const extraKey = extraInboxUserIds.join('|');
    const accessToken = useAuthStore((s) => s.accessToken);

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessagePayload | null>(null);
    const [lastConversationEvent, setLastConversationEvent] = useState<ConversationActivityEvent | null>(null);
    const [lastReadReceipt, setLastReadReceipt] = useState<WebSocketReadReceiptPayload | null>(null);
    const [lastEdited, setLastEdited] = useState<WebSocketEditedPayload | null>(null);
    const [lastDeleted, setLastDeleted] = useState<WebSocketDeletedPayload | null>(null);
    const [lastReaction, setLastReaction] = useState<WebSocketReactionPayload | null>(null);

    const clientRef = useRef<Client | null>(null);
    const subsRef = useRef<Record<string, { unsubscribe: () => void }>>({});

    const prevConnectedRef = useRef<boolean | undefined>(undefined);
    const hadConnectedOnceRef = useRef(false);
    const onReconnectRef = useRef(onReconnect);
    onReconnectRef.current = onReconnect;

    // 1. Manage connection: rehydrate auth first so STOMP uses the same identity as REST (Bearer + /topic/user/{sub}/...).
    useEffect(() => {
        let cancelled = false;

        void (async () => {
            await useAuthStore.persist.rehydrate();
            if (cancelled) return;

            const token = useAuthStore.getState().accessToken;
            const guestIdForHeader = token ? null : getOrCreateGuestId();
            const connectHeaders: Record<string, string> = token
                ? { Authorization: `Bearer ${token}` }
                : {
                      'X-Guest-ID': guestIdForHeader!,
                      'x-guest-id': guestIdForHeader!,
                  };

            const topicUserId = token
                ? getKeycloakSubFromAccessToken(token) ?? userId
                : userId ?? guestIdForHeader;

            devWsLog('connecting', {
                url: WEBSOCKET_URL,
                apiBase: API_BASE_URL,
                mode: token ? 'bearer' : 'guest',
                topicUserId,
                userIdTopic: topicUserId ? `/topic/user/${topicUserId}/conversations` : null,
            });

            const stompClient = new Client({
                webSocketFactory: () => new SockJS(WEBSOCKET_URL),
                connectHeaders,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    if (cancelled) return;
                    setIsConnected(true);
                    devWsLog('STOMP connected', { topicUserId, mode: token ? 'bearer' : 'guest' });

                    const inboxHandler = (msg: { body: string }) => {
                        try {
                            const data = JSON.parse(msg.body);
                            if (data?.type === 'CONVERSATION_ACTIVITY') {
                                devWsLog('CONVERSATION_ACTIVITY', data?.conversationId);
                                setLastConversationEvent(data);
                            }
                        } catch (err) {
                            console.error('User subscription error:', err);
                        }
                    };

                    const subscribed = new Set<string>();
                    if (topicUserId) {
                        const topic = `/topic/user/${topicUserId}/conversations`;
                        devWsLog('subscribe', topic);
                        stompClient.subscribe(topic, inboxHandler);
                        subscribed.add(topicUserId);
                    }
                    for (const extraId of extraInboxUserIds) {
                        if (!extraId || subscribed.has(extraId)) continue;
                        const t = `/topic/user/${extraId}/conversations`;
                        devWsLog('subscribe extra inbox', t);
                        stompClient.subscribe(t, inboxHandler);
                        subscribed.add(extraId);
                    }
                },
                onDisconnect: () => {
                    devWsLog('STOMP disconnected');
                    setIsConnected(false);
                },
                onStompError: (frame) => {
                    devWsLog('STOMP error', frame?.headers?.message ?? frame);
                    setIsConnected(false);
                },
                onWebSocketError: (e) => {
                    devWsLog('WebSocket error', e);
                    setIsConnected(false);
                },
            });

            if (cancelled) return;
            clientRef.current = stompClient;
            stompClient.activate();
        })();

        return () => {
            cancelled = true;
            devWsLog('deactivate client');
            clientRef.current?.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        };
    }, [userId, accessToken, extraKey]);

    // Reconnect → resync (skip first successful connection). Callback via ref so parent identity changes do not retrigger this effect.
    useEffect(() => {
        if (isConnected) {
            if (hadConnectedOnceRef.current && prevConnectedRef.current === false) {
                onReconnectRef.current?.();
            }
            hadConnectedOnceRef.current = true;
        }
        prevConnectedRef.current = isConnected;
    }, [isConnected]);

    // 2. Manage Dynamic Conversation Subscriptions
    useEffect(() => {
        const client = clientRef.current;
        if (!client || !isConnected || !conversationId) return;

        if (subsRef.current['chat']) subsRef.current['chat'].unsubscribe();
        if (subsRef.current['read']) subsRef.current['read'].unsubscribe();
        if (subsRef.current['edited']) subsRef.current['edited'].unsubscribe();
        if (subsRef.current['deleted']) subsRef.current['deleted'].unsubscribe();
        if (subsRef.current['reaction']) subsRef.current['reaction'].unsubscribe();

        const chatTopic = `/topic/conversation/${conversationId}`;
        devWsLog('subscribe conversation', chatTopic);
        subsRef.current['chat'] = client.subscribe(chatTopic, (msg: { body: string }) => {
            try {
                setLastMessage(JSON.parse(msg.body));
            } catch {
                /* ignore */
            }
        });

        const readTopic = `/topic/conversation/${conversationId}/read-receipt`;
        devWsLog('subscribe read-receipt', readTopic);
        subsRef.current['read'] = client.subscribe(
            readTopic,
            (msg: { body: string }) => {
                try {
                    const data = JSON.parse(msg.body);
                    setLastReadReceipt({
                        ...data,
                        conversationId: conversationId,
                    });
                } catch {
                    /* ignore */
                }
            },
        );

        const editedTopic = `/topic/conversation/${conversationId}/edited`;
        devWsLog('subscribe edited', editedTopic);
        subsRef.current['edited'] = client.subscribe(editedTopic, (msg: { body: string }) => {
            try {
                setLastEdited(JSON.parse(msg.body));
            } catch {
                /* ignore */
            }
        });

        const deletedTopic = `/topic/conversation/${conversationId}/deleted`;
        devWsLog('subscribe deleted', deletedTopic);
        subsRef.current['deleted'] = client.subscribe(deletedTopic, (msg: { body: string }) => {
            try {
                setLastDeleted(JSON.parse(msg.body));
            } catch {
                /* ignore */
            }
        });

        const reactionTopic = `/topic/conversation/${conversationId}/reaction`;
        devWsLog('subscribe reaction', reactionTopic);
        subsRef.current['reaction'] = client.subscribe(reactionTopic, (msg: { body: string }) => {
            try {
                setLastReaction(JSON.parse(msg.body));
            } catch {
                /* ignore */
            }
        });

        return () => {
            if (subsRef.current['chat']) subsRef.current['chat'].unsubscribe();
            if (subsRef.current['read']) subsRef.current['read'].unsubscribe();
            if (subsRef.current['edited']) subsRef.current['edited'].unsubscribe();
            if (subsRef.current['deleted']) subsRef.current['deleted'].unsubscribe();
            if (subsRef.current['reaction']) subsRef.current['reaction'].unsubscribe();
        };
    }, [conversationId, isConnected]);

    return {
        isConnected,
        lastMessage,
        lastConversationEvent,
        lastReadReceipt,
        lastEdited,
        lastDeleted,
        lastReaction,
    };
}
