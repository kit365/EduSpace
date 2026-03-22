import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Headphones } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { messageService } from '../../client/features/customer/messages/services/messageService';
import type { ChatMessage, Conversation } from '../../client/features/customer/messages/types';
import { useChatWebSocket } from '../../client/features/customer/messages/hooks/useChatWebSocket';
import { isSupportPlaceholderUserId, SUPPORT_PLACEHOLDER_USER_ID } from '../../config/chat';
import { useResolvedChatUserId } from '../../hooks/useResolvedChatUserId';
import { useAuthHydrated } from '../../hooks/useAuthHydrated';
import { SUPPORT_CHAT_SYNC_EVENT, emitSupportChatSync } from '../../client/features/customer/messages/supportChatSync';
import {
    clearStoredSupportConversationId,
    getStoredSupportConversationId,
    setStoredSupportConversationId,
} from '../../client/features/customer/messages/supportConversationStorage';
import { AnimatePresence, motion } from 'framer-motion';

const STAFF_ASSIGN_FAILED_HINT = 'không có nhân viên';
const LIST_FETCH_MIN_MS = 2000;

function pickSupportConversation(convs: Conversation[]) {
    return (
        convs.find((c) => c.isAdminConversation === true) ??
        convs.find((c) => isSupportPlaceholderUserId(c.otherUser?.userId))
    );
}

function shouldClearStoredConversation(err: unknown): boolean {
    if (typeof err !== 'object' || err === null || !('response' in err)) return false;
    const status = (err as { response?: { status?: number } }).response?.status;
    return status === 404 || status === 403;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [onlineStaffCount, setOnlineStaffCount] = useState<number | null>(null);

    const authHydrated = useAuthHydrated();
    const { chatUserId: currentUserId, identityReady } = useResolvedChatUserId();
    const scrollRef = useRef<HTMLDivElement>(null);
    /** Avoid hammering GET /conversations on every CONVERSATION_ACTIVITY / reconnect. */
    const lastListFetchAtRef = useRef(0);
    /** Always current — `loadSupportThread` must not read stale `conversation` from closure. */
    const conversationIdRef = useRef<string | null>(null);

    useEffect(() => {
        conversationIdRef.current = conversation?.conversationId ?? null;
    }, [conversation?.conversationId]);

    const reloadMessages = useCallback(async () => {
        const id = conversationIdRef.current;
        if (!id) return;
        try {
            const history = await messageService.getMessages(id, 0, 50);
            setMessages(history.slice().reverse());
        } catch (err) {
            console.error('Failed to reload messages', err);
        }
    }, []);

    /** Một lần sau layout — tránh xếp chồng microtask/rAF/setTimeout + MutationObserver (gây giật). */
    const scrollToBottom = useCallback(() => {
        const pane = scrollRef.current;
        if (!pane) return;
        pane.scrollTop = pane.scrollHeight;
    }, []);

    const { lastMessage, lastConversationEvent } = useChatWebSocket({
        conversationId: conversation?.conversationId ?? null,
        userId: currentUserId,
        onReconnect: reloadMessages,
    });

    useLayoutEffect(() => {
        scrollToBottom();
        const id = requestAnimationFrame(() => {
            scrollToBottom();
        });
        return () => cancelAnimationFrame(id);
    }, [messages, scrollToBottom]);

    // Listen for staff assignment events
    useEffect(() => {
        if (
            lastConversationEvent?.type === 'CONVERSATION_ACTIVITY' &&
            lastConversationEvent.conversationId === conversation?.conversationId
        ) {
            const updateChat = async () => {
                const now = Date.now();
                if (now - lastListFetchAtRef.current < LIST_FETCH_MIN_MS) return;
                lastListFetchAtRef.current = now;
                try {
                    const updated = await messageService.getConversations();
                    const match = updated.find((c) => c.conversationId === conversation?.conversationId);
                    if (match && !isSupportPlaceholderUserId(match.otherUser?.userId)) {
                        setConversation(match);
                        setIsMatching(false);
                    }
                } catch (err) {
                    console.error('Failed to update conversation after assignment:', err);
                }
            };
            updateChat();
        }
    }, [lastConversationEvent, conversation]);

    // Listen for open-support-chat event (from Help page)
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-support-chat', handleOpen);
        return () => window.removeEventListener('open-support-chat', handleOpen);
    }, []);

    // Support staff currently online (admin portal heartbeat), refresh while widget open
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        const load = async () => {
            try {
                const n = await messageService.getOnlineSupportStaffCount();
                if (!cancelled) setOnlineStaffCount(n);
            } catch {
                if (!cancelled) setOnlineStaffCount(null);
            }
        };
        load();
        const t = window.setInterval(load, 45000);
        return () => {
            cancelled = true;
            window.clearInterval(t);
        };
    }, [isOpen]);

    /** Load support thread from API (same data as /messages). Chỉ gọi khi auth đã rehydrate + identity sẵn sàng — tránh GET sớm sau F5. */
    const loadSupportThread = useCallback(async () => {
        if (!authHydrated || !identityReady) return;
        await useAuthStore.persist.rehydrate();
        const now = Date.now();
        lastListFetchAtRef.current = now;
        try {
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.info('[ChatWidget] load support thread', {
                    hasToken: !!useAuthStore.getState().accessToken,
                    currentUserId,
                });
            }
            const convs = await messageService.getConversations();
            const supportConv = pickSupportConversation(convs);
            const localId = conversationIdRef.current;

            const applyThread = async (conv: Conversation) => {
                setStoredSupportConversationId(currentUserId, conv.conversationId);
                setConversation(conv);
                const history = await messageService.getMessages(conv.conversationId, 0, 50);
                setMessages(history.slice().reverse());
                setIsMatching(isSupportPlaceholderUserId(conv.otherUser?.userId));
            };

            if (supportConv) {
                await applyThread(supportConv);
                return;
            }

            const storedId = getStoredSupportConversationId(currentUserId);
            if (storedId) {
                try {
                    const conv = await messageService.getConversationById(storedId);
                    await applyThread(conv);
                    return;
                } catch (err) {
                    if (shouldClearStoredConversation(err)) {
                        clearStoredSupportConversationId(currentUserId);
                    } else {
                        console.error('[ChatWidget] restore thread from stored id failed', err);
                        return;
                    }
                }
            }

            // List chưa kịp có isAdminConversation (race sau POST) — đừng xóa UI; ưu tiên id đang giữ trong ref.
            if (localId) {
                const matchById = convs.find((c) => c.conversationId === localId);
                if (matchById) {
                    await applyThread(matchById);
                    return;
                }
                try {
                    const conv = await messageService.getConversationById(localId);
                    await applyThread(conv);
                    return;
                } catch {
                    try {
                        const history = await messageService.getMessages(localId, 0, 50);
                        setMessages(history.slice().reverse());
                    } catch {
                        /* thread có thể chưa readable — giữ state hiện tại */
                    }
                }
                return;
            }

            setConversation(null);
            setMessages([]);
            setIsMatching(false);
            clearStoredSupportConversationId(currentUserId);
        } catch (err) {
            console.error('Failed to load support chat widget:', err);
        }
    }, [authHydrated, identityReady, currentUserId]);

    /** Lần đầu (và mỗi lần) mở widget: fetch thread — tránh race sau refresh khi gọi API lúc tab chưa sẵn sàng. */
    useEffect(() => {
        if (!isOpen || !authHydrated || !identityReady) return;
        void loadSupportThread();
    }, [isOpen, authHydrated, identityReady, loadSupportThread]);

    /** Đồng bộ với trang /messages — debounce để list BE kịp có support conv trước khi refetch. */
    useEffect(() => {
        let t: ReturnType<typeof setTimeout> | undefined;
        const onSync = () => {
            if (t) clearTimeout(t);
            t = setTimeout(() => {
                void loadSupportThread();
            }, 280);
        };
        window.addEventListener(SUPPORT_CHAT_SYNC_EVENT, onSync);
        return () => {
            if (t) clearTimeout(t);
            window.removeEventListener(SUPPORT_CHAT_SYNC_EVENT, onSync);
        };
    }, [loadSupportThread]);

    // Handle incoming messages
    useEffect(() => {
        if (lastMessage && conversation && lastMessage.conversationId === conversation.conversationId) {
            setMessages((prev) => {
                if (prev.some((m) => m.messageId === lastMessage.messageId)) return prev;
                return [
                    ...prev,
                    {
                        messageId: lastMessage.messageId,
                        conversationId: lastMessage.conversationId,
                        content: lastMessage.content,
                        messageType: lastMessage.messageType,
                        sentAt: lastMessage.sentAt,
                        sender: {
                            userId: lastMessage.senderId,
                            fullName: lastMessage.senderUsername,
                            avatarUrl: null,
                            email: null,
                        },
                        isRead: false,
                        isDeleted: false,
                        mediaUrl: lastMessage.mediaUrl,
                        mediaType: null,
                        readAt: null,
                        editedAt: null,
                        reactions: null,
                        replyToMessageId: null,
                    } as ChatMessage,
                ];
            });

            if (lastMessage.messageType === 'SYSTEM') {
                const c = (lastMessage.content || '').toLowerCase();
                if (c.includes(STAFF_ASSIGN_FAILED_HINT)) {
                    setIsMatching(false);
                }
            }

            if (
                currentUserId != null &&
                !isSupportPlaceholderUserId(lastMessage.senderId) &&
                lastMessage.senderId !== currentUserId
            ) {
                setIsMatching(false);
            }
        }
    }, [lastMessage, conversation, currentUserId]);

    const handleSend = async () => {
        if (!input.trim() || loading || isCreatingChat) return;
        const text = input;
        setInput('');
        setLoading(true);

        try {
            let activeConv = conversation;

            if (!activeConv) {
                setIsCreatingChat(true);
                try {
                    activeConv = await messageService.createConversation(SUPPORT_PLACEHOLDER_USER_ID, true);
                    setConversation(activeConv);
                    conversationIdRef.current = activeConv.conversationId;
                    setStoredSupportConversationId(currentUserId, activeConv.conversationId);
                    setIsMatching(true);
                } finally {
                    setIsCreatingChat(false);
                }
            }

            const newMsg = await messageService.sendText(activeConv!.conversationId, text);
            setStoredSupportConversationId(currentUserId, activeConv!.conversationId);
            setMessages((prev) => {
                if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
                return [...prev, newMsg];
            });
            emitSupportChatSync();
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[70] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-96 h-[500px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-red-500 text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Headphones className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-tight">Admin Support</h3>
                                    <p className="text-[10px] text-red-100 font-bold uppercase tracking-widest">
                                        {isMatching ? 'Matching you with staff...' : "We're here to help"}
                                    </p>
                                    {onlineStaffCount !== null && (
                                        <p className="text-[9px] text-red-50/90 font-semibold mt-0.5">
                                            {onlineStaffCount === 0
                                                ? 'No support staff online right now'
                                                : `${onlineStaffCount} support staff online`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto overflow-anchor-none p-6 space-y-4 bg-slate-50/50"
                        >
                            {messages.length === 0 && !loading && !isCreatingChat && (
                                <div className="text-center py-10">
                                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm font-bold">Start a conversation with our team!</p>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const rowKey = msg.messageId ?? `row-${i}-${msg.sentAt ?? ''}`;
                                if (msg.messageType === 'SYSTEM') {
                                    return (
                                        <div key={rowKey} className="flex justify-center my-2">
                                            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium italic">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                const isMe = !!currentUserId && msg.sender?.userId === currentUserId;
                                return (
                                    <div key={rowKey} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm ${
                                                isMe
                                                    ? 'bg-red-500 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}

                            {isMatching && (
                                <div className="flex justify-start">
                                    <div className="bg-white border italic border-red-100 p-4 rounded-2xl rounded-bl-none text-xs text-red-500 font-bold flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Finding a specialist for you...
                                    </div>
                                </div>
                            )}
                            <div className="h-px w-full shrink-0" aria-hidden />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-50">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-red-200 focus-within:bg-white transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-transparent px-2 py-2 outline-none text-sm font-bold text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading || isCreatingChat}
                                    className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 active:scale-95 disabled:opacity-50 transition-all font-black shadow-lg shadow-red-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Button */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all border-b-4 ${
                    isOpen ? 'bg-gray-800 border-gray-900 rotate-90' : 'bg-red-500 border-red-700 shadow-red-200'
                } text-white`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
            </motion.button>
        </div>
    );
}
