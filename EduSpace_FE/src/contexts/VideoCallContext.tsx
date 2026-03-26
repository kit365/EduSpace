 
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../lib/axios';
import { API_PREFIX } from '../config/api/base';
import { useAuthStore } from '../stores/authStore';

type VideoCallEventType = 'INCOMING_CALL' | 'CALL_ACCEPTED' | 'CALL_DECLINED' | 'CALL_ENDED';

export interface VideoCallNotification {
    type: VideoCallEventType;
    callId: string;
    callSessionId: string;
    callStatus: string;
    callerUserId: string;
    receiverUserId: string;
    conversationId: string;
    reason?: string;
    callDuration?: number;
}

interface VideoCallContextValue {
    incomingCall: VideoCallNotification | null;
    activeCall: VideoCallNotification | null;
    lastEvent: VideoCallNotification | null;
    initiateCall: (conversationId: string) => Promise<void>;
    acceptCall: (callSessionId: string) => Promise<void>;
    declineCall: (callSessionId: string, reason?: string) => Promise<void>;
    endCall: (callSessionId: string, reason?: string) => Promise<void>;
}

const VideoCallContext = createContext<VideoCallContextValue | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const WEBSOCKET_URL = API_BASE_URL + '/ws';
const WS_HEALTHCHECK_TIMEOUT_MS = 2500;
const WS_COOLDOWN_MS = 30000;
let wsCooldownUntil = 0;

async function canConnectWebSocketGateway(): Promise<boolean> {
    if (Date.now() < wsCooldownUntil) return false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), WS_HEALTHCHECK_TIMEOUT_MS);
    try {
        const res = await fetch(`${WEBSOCKET_URL}/info?t=${Date.now()}`, {
            method: 'GET',
            signal: controller.signal,
        });
        if (!res.ok) {
            wsCooldownUntil = Date.now() + WS_COOLDOWN_MS;
            return false;
        }
        return true;
    } catch {
        wsCooldownUntil = Date.now() + WS_COOLDOWN_MS;
        return false;
    } finally {
        window.clearTimeout(timer);
    }
}

export function VideoCallProvider({ children }: { children: ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);

    const [incomingCall, setIncomingCall] = useState<VideoCallNotification | null>(null);
    const [activeCall, setActiveCall] = useState<VideoCallNotification | null>(null);
    const [lastEvent, setLastEvent] = useState<VideoCallNotification | null>(null);

    const clientRef = useRef<any>(null);

    const connect = useCallback(async () => {
        if (!accessToken) return;
        if (!(await canConnectWebSocketGateway())) return;

        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: { Authorization: `Bearer ${accessToken}` },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                stompClient.subscribe('/topic/video-call/notifications', (msg: any) => {
                    try {
                        const data = JSON.parse(msg.body) as VideoCallNotification;
                        setLastEvent(data);
                        if (data.type === 'INCOMING_CALL') {
                            setIncomingCall(data);
                        }
                        if (data.type === 'CALL_ACCEPTED') {
                            setActiveCall(data);
                            setIncomingCall(null);
                        }
                        if (data.type === 'CALL_DECLINED' || data.type === 'CALL_ENDED') {
                            setActiveCall(null);
                            setIncomingCall(null);
                        }
                    } catch {
                        // ignore
                    }
                });
            },
            onStompError: () => {
                wsCooldownUntil = Date.now() + WS_COOLDOWN_MS;
                setIncomingCall(null);
            },
            onWebSocketError: () => {
                wsCooldownUntil = Date.now() + WS_COOLDOWN_MS;
                setIncomingCall(null);
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [accessToken]);

    useEffect(() => {
        connect();
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [connect]);

    const initiateCall = useCallback(
        async (conversationId: string) => {
            await apiClient.post(`${API_PREFIX}/azure-communication/calls/initiate`, { conversationId });
        },
        [],
    );

    const acceptCall = useCallback(async (callSessionId: string) => {
        await apiClient.post(`${API_PREFIX}/azure-communication/calls/${callSessionId}/answer`);
    }, []);

    const declineCall = useCallback(async (callSessionId: string, reason?: string) => {
        await apiClient.post(`${API_PREFIX}/azure-communication/calls/${callSessionId}/decline`, reason ? { reason } : {});
    }, []);

    const endCall = useCallback(async (callSessionId: string, reason?: string) => {
        await apiClient.post(`${API_PREFIX}/azure-communication/calls/${callSessionId}/end`, reason ? { reason } : {});
    }, []);

    const value = useMemo<VideoCallContextValue>(
        () => ({
            incomingCall,
            activeCall,
            lastEvent,
            initiateCall,
            acceptCall,
            declineCall,
            endCall,
        }),
        [incomingCall, activeCall, lastEvent, initiateCall, acceptCall, declineCall, endCall],
    );

    return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
}

export function useVideoCall() {
    const ctx = useContext(VideoCallContext);
    if (!ctx) {
        throw new Error('useVideoCall must be used within VideoCallProvider');
    }
    return ctx;
}

