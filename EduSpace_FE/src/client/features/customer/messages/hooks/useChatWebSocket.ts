import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../../../stores/authStore';
import { getOrCreateGuestId } from '../../../../../utils/guest';
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

    const clientRef = useRef<Client | null>(null);
    const subsRef = useRef<Record<string, any>>({}); // Track active subscriptions

    // 1. Manage Connection Lifetime
    useEffect(() => {
        const token = useAuthStore.getState().accessToken;
        
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: token 
                ? { Authorization: `Bearer ${token}` } 
                : { 
                    'X-Guest-ID': getOrCreateGuestId(),
                    'x-guest-id': getOrCreateGuestId() 
                  },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                
                // Subscription to USER (Always active if userId exists)
                if (userId) {
                    stompClient.subscribe(`/topic/user/${userId}/conversations`, (msg: any) => {
                        try {
                            const data = JSON.parse(msg.body);
                            if (data?.type === 'CONVERSATION_ACTIVITY') {
                                setLastConversationEvent(data);
                            }
                        } catch (err) {
                            console.error('User subscription error:', err);
                        }
                    });
                }
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: () => setIsConnected(false),
            onWebSocketError: () => setIsConnected(false),
        });

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            stompClient.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        };
    }, [userId]); // Only reconnect if user identity changes

    // 2. Manage Dynamic Conversation Subscriptions
    useEffect(() => {
        const client = clientRef.current;
        if (!client || !isConnected || !conversationId) return;

        // Unsubscribe from previous conversation if any
        if (subsRef.current['chat']) subsRef.current['chat'].unsubscribe();
        if (subsRef.current['read']) subsRef.current['read'].unsubscribe();

        // New Subscriptions
        subsRef.current['chat'] = client.subscribe(`/topic/conversation/${conversationId}`, (msg: any) => {
            try {
                setLastMessage(JSON.parse(msg.body));
            } catch (err) { /* ignore */ }
        });

        subsRef.current['read'] = client.subscribe(`/topic/conversation/${conversationId}/read-receipt`, (msg: any) => {
            try {
                const data = JSON.parse(msg.body);
                setLastReadReceipt({
                    ...data,
                    conversationId: conversationId
                });
            } catch (err) { /* ignore */ }
        });

        return () => {
            if (subsRef.current['chat']) subsRef.current['chat'].unsubscribe();
            if (subsRef.current['read']) subsRef.current['read'].unsubscribe();
        };
    }, [conversationId, isConnected]);

    return { isConnected, lastMessage, lastConversationEvent, lastReadReceipt };

    return { isConnected, lastMessage, lastConversationEvent, lastReadReceipt };
}

