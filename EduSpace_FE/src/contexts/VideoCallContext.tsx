 
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type ReactNode,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../lib/axios';
import { API_PREFIX } from '../config/api/base';
import { getKeycloakSubFromAccessToken } from '../config/chat';
import { useAuthStore } from '../stores/authStore';
import azureCommunicationService from '../services/azureCommunicationService';

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

type CallState = 'idle' | 'outgoing_waiting' | 'incoming_ringing' | 'connected' | 'ended';
type CallAction =
    | { type: 'startOutgoing'; payload: VideoCallNotification }
    | { type: 'incoming'; payload: VideoCallNotification }
    | { type: 'connected'; payload: VideoCallNotification }
    | { type: 'ended'; payload: VideoCallNotification }
    | { type: 'clearIncoming' }
    | { type: 'setEnded'; reason: string }
    | { type: 'cleanup' };

type CallUiState = {
    callState: CallState;
    incomingCall: VideoCallNotification | null;
    activeCall: VideoCallNotification | null;
    lastEvent: VideoCallNotification | null;
};

const initialState: CallUiState = {
    callState: 'idle',
    incomingCall: null,
    activeCall: null,
    lastEvent: null,
};

function reducer(state: CallUiState, action: CallAction): CallUiState {
    switch (action.type) {
        case 'startOutgoing':
            return {
                ...state,
                callState: 'outgoing_waiting',
                activeCall: action.payload,
                lastEvent: action.payload,
                incomingCall: null,
            };
        case 'incoming':
            return {
                ...state,
                callState: 'incoming_ringing',
                incomingCall: action.payload,
                lastEvent: action.payload,
            };
        case 'connected':
            return {
                ...state,
                callState: 'connected',
                activeCall: action.payload,
                incomingCall: null,
                lastEvent: action.payload,
            };
        case 'ended':
            return {
                ...state,
                callState: 'ended',
                activeCall: null,
                incomingCall: null,
                lastEvent: action.payload,
            };
        case 'clearIncoming':
            return { ...state, incomingCall: null, callState: 'idle' };
        case 'setEnded':
            return {
                ...state,
                callState: 'ended',
                activeCall: null,
                incomingCall: null,
                lastEvent: state.lastEvent
                    ? { ...state.lastEvent, reason: action.reason }
                    : null,
            };
        case 'cleanup':
            return initialState;
        default:
            return state;
    }
}

export function VideoCallProvider({ children }: { children: ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const [state, dispatch] = useReducer(reducer, initialState);

    const clientRef = useRef<any>(null);
    const outgoingTokenBySessionRef = useRef<Record<string, string>>({});
    const outgoingTimeoutRef = useRef<number | null>(null);
    const currentUserId = useMemo(
        () => getKeycloakSubFromAccessToken(accessToken ?? '') ?? null,
        [accessToken]
    );

    const connect = useCallback(() => {
        if (!accessToken) return;

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
                        const mine =
                            !!currentUserId &&
                            (data.callerUserId === currentUserId || data.receiverUserId === currentUserId);
                        if (!mine) return;

                        if (data.type === 'INCOMING_CALL' && data.receiverUserId === currentUserId) {
                            dispatch({ type: 'incoming', payload: data });
                        } else if (data.type === 'CALL_ACCEPTED') {
                            dispatch({ type: 'connected', payload: data });
                            const myToken = outgoingTokenBySessionRef.current[data.callSessionId];
                            if (myToken) {
                                void (async () => {
                                    try {
                                        await azureCommunicationService.createCallAgent(myToken);
                                        let localStream: any;
                                        try {
                                            localStream = await azureCommunicationService.createLocalVideoStream();
                                        } catch {
                                            localStream = undefined;
                                        }
                                        await azureCommunicationService.joinCall(data.callSessionId, localStream);
                                    } catch {
                                        // keep signaling flow even if media init fails
                                    }
                                })();
                            }
                        } else if (data.type === 'CALL_DECLINED' || data.type === 'CALL_ENDED') {
                            dispatch({ type: 'ended', payload: data });
                            delete outgoingTokenBySessionRef.current[data.callSessionId];
                            void azureCommunicationService.cleanup();
                        }
                    } catch {
                        // ignore
                    }
                });
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [accessToken]);

    useEffect(() => {
        connect();
        return () => {
            if (outgoingTimeoutRef.current) {
                window.clearTimeout(outgoingTimeoutRef.current);
                outgoingTimeoutRef.current = null;
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            void azureCommunicationService.cleanup();
        };
    }, [connect, accessToken]);

    const unwrapResponsePayload = <T,>(input: any): T => {
        if (input && typeof input === 'object' && 'data' in input) {
            return input.data as T;
        }
        return input as T;
    };

    const initiateCall = useCallback(
        async (conversationId: string) => {
            try {
                const res = await apiClient.post<any, any>(`${API_PREFIX}/azure-communication/calls/initiate`, { conversationId });
                const data = unwrapResponsePayload<any>(res);
                const payload: VideoCallNotification = {
                    type: 'INCOMING_CALL',
                    callId: String(data.callId),
                    callSessionId: String(data.callSessionId),
                    callStatus: String(data.callStatus ?? 'INITIATED'),
                    callerUserId: currentUserId ?? '',
                    receiverUserId: '',
                    conversationId,
                };
                const myToken = data?.yourToken?.token;
                if (myToken) {
                    outgoingTokenBySessionRef.current[String(data.callSessionId)] = myToken;
                }
                if (outgoingTimeoutRef.current) {
                    window.clearTimeout(outgoingTimeoutRef.current);
                }
                outgoingTimeoutRef.current = window.setTimeout(() => {
                    dispatch({ type: 'setEnded', reason: 'Receiver did not answer' });
                }, 30000);
                dispatch({ type: 'startOutgoing', payload });
            } catch (error: any) {
                const backendMessage =
                    error?.response?.data?.message ??
                    error?.response?.data?.data?.message ??
                    error?.message ??
                    'Failed to initiate call';
                if (String(backendMessage).toLowerCase().includes('ongoing call')) {
                    dispatch({ type: 'setEnded', reason: 'You already have an ongoing call. End it first.' });
                    return;
                }
                dispatch({ type: 'setEnded', reason: String(backendMessage) });
            }
        },
        [currentUserId],
    );

    const acceptCall = useCallback(async (callSessionId: string) => {
        const res = await apiClient.post<any, any>(`${API_PREFIX}/azure-communication/calls/${callSessionId}/answer`);
        const data = unwrapResponsePayload<any>(res);
        const token = data?.yourToken?.token;
        if (token) {
            await azureCommunicationService.createCallAgent(token);
            let localStream: any;
            try {
                localStream = await azureCommunicationService.createLocalVideoStream();
            } catch {
                localStream = undefined;
            }
            await azureCommunicationService.joinCall(callSessionId, localStream);
        }
        delete outgoingTokenBySessionRef.current[callSessionId];
        if (outgoingTimeoutRef.current) {
            window.clearTimeout(outgoingTimeoutRef.current);
            outgoingTimeoutRef.current = null;
        }
        dispatch({ type: 'clearIncoming' });
    }, []);

    const declineCall = useCallback(async (callSessionId: string, reason?: string) => {
        await apiClient.post(`${API_PREFIX}/azure-communication/calls/${callSessionId}/decline`, reason ? { reason } : {});
        if (outgoingTimeoutRef.current) {
            window.clearTimeout(outgoingTimeoutRef.current);
            outgoingTimeoutRef.current = null;
        }
        dispatch({ type: 'clearIncoming' });
    }, []);

    const endCall = useCallback(async (callSessionId: string, reason?: string) => {
        await apiClient.post(`${API_PREFIX}/azure-communication/calls/${callSessionId}/end`, reason ? { reason } : {});
        delete outgoingTokenBySessionRef.current[callSessionId];
        if (outgoingTimeoutRef.current) {
            window.clearTimeout(outgoingTimeoutRef.current);
            outgoingTimeoutRef.current = null;
        }
        await azureCommunicationService.cleanup();
        dispatch({ type: 'cleanup' });
    }, []);

    const value = useMemo<VideoCallContextValue>(
        () => ({
            incomingCall: state.incomingCall,
            activeCall: state.activeCall,
            lastEvent: state.lastEvent,
            initiateCall,
            acceptCall,
            declineCall,
            endCall,
        }),
        [state, initiateCall, acceptCall, declineCall, endCall],
    );

    const reason = state.lastEvent?.reason ?? 'Call ended';

    return (
        <VideoCallContext.Provider value={value}>
            {children}
            {state.callState === 'incoming_ringing' && state.incomingCall && (
                <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border bg-white p-4 shadow-2xl">
                    <div className="mb-3 text-sm font-semibold text-slate-800">Incoming video call</div>
                    <div className="mb-4 text-xs text-slate-500">Session: {state.incomingCall.callSessionId}</div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
                            onClick={() => void acceptCall(state.incomingCall!.callSessionId)}
                        >
                            Accept
                        </button>
                        <button
                            className="flex-1 rounded-md bg-rose-600 px-3 py-2 text-sm text-white"
                            onClick={() => void declineCall(state.incomingCall!.callSessionId)}
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}
            {state.callState === 'outgoing_waiting' && state.activeCall && (
                <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border bg-white p-4 shadow-2xl">
                    <div className="mb-2 text-sm font-semibold text-slate-800">Calling...</div>
                    <div className="mb-4 text-xs text-slate-500">Session: {state.activeCall.callSessionId}</div>
                    <button
                        className="w-full rounded-md bg-slate-700 px-3 py-2 text-sm text-white"
                        onClick={() => void endCall(state.activeCall!.callSessionId, 'Caller canceled')}
                    >
                        Cancel
                    </button>
                </div>
            )}
            {state.callState === 'connected' && state.activeCall && (
                <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border bg-white p-4 shadow-2xl">
                    <div className="mb-2 text-sm font-semibold text-slate-800">Video call connected</div>
                    <div className="mb-4 text-xs text-slate-500">Session: {state.activeCall.callSessionId}</div>
                    <button
                        className="w-full rounded-md bg-rose-600 px-3 py-2 text-sm text-white"
                        onClick={() => void endCall(state.activeCall!.callSessionId, 'User ended call')}
                    >
                        End call
                    </button>
                </div>
            )}
            {state.callState === 'ended' && (
                <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-xl border bg-white p-4 shadow-2xl">
                    <div className="mb-2 text-sm font-semibold text-slate-800">Call ended</div>
                    <div className="mb-4 text-xs text-slate-500">{reason}</div>
                    <button
                        className="w-full rounded-md bg-slate-700 px-3 py-2 text-sm text-white"
                        onClick={() => dispatch({ type: 'cleanup' })}
                    >
                        Close
                    </button>
                </div>
            )}
        </VideoCallContext.Provider>
    );
}

export function useVideoCall() {
    const ctx = useContext(VideoCallContext);
    if (!ctx) {
        throw new Error('useVideoCall must be used within VideoCallProvider');
    }
    return ctx;
}

