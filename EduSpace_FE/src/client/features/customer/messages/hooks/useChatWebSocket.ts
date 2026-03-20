import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../../../stores/authStore';
import type { ConversationActivityEvent, WebSocketMessagePayload, WebSocketReadReceiptPayload } from '../types';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const WEBSOCKET_URL = API_BASE_URL + '/ws';

export function useChatWebSocket(params: { conversationId: string | null; userId: string | null }) {
    const { conversationId, userId } = params;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessagePayload | null>(null);
    const [lastConversationEvent, setLastConversationEvent] = useState<ConversationActivityEvent | null>(null);
    const [lastReadReceipt, setLastReadReceipt] = useState<WebSocketReadReceiptPayload | null>(null);

    const clientRef = useRef<any>(null);
    const connectTimeout = useRef<number | null>(null);

    const connect = useCallback(() => {
        const token = useAuthStore.getState().accessToken;

        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);

                if (conversationId) {
                    stompClient.subscribe(`/topic/conversation/${conversationId}`, (msg: any) => {
                        try {
                            setLastMessage(JSON.parse(msg.body));
                        } catch {
                            // ignore
                        }
                    });

                    stompClient.subscribe(`/topic/conversation/${conversationId}/read-receipt`, (msg: any) => {
                        try {
                            setLastReadReceipt(JSON.parse(msg.body));
                        } catch {
                            // ignore
                        }
                    });
                }

                if (userId) {
                    stompClient.subscribe(`/topic/user/${userId}/conversations`, (msg: any) => {
                        try {
                            const data = JSON.parse(msg.body);
                            if (data?.type === 'CONVERSATION_ACTIVITY') {
                                setLastConversationEvent(data);
                            }
                        } catch {
                            // ignore
                        }
                    });
                }
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
            onStompError: () => {
                setIsConnected(false);
            },
            onWebSocketError: () => {
                setIsConnected(false);
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [conversationId, userId]);

    useEffect(() => {
        if (connectTimeout.current) {
            window.clearTimeout(connectTimeout.current);
        }
        connectTimeout.current = window.setTimeout(connect, 50);

        return () => {
            if (connectTimeout.current) {
                window.clearTimeout(connectTimeout.current);
                connectTimeout.current = null;
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [connect]);

    return { isConnected, lastMessage, lastConversationEvent, lastReadReceipt };
}

