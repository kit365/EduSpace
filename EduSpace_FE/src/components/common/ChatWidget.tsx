import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Headphones, Paperclip } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { messageService } from '../../client/features/customer/messages/services/messageService';
import type { ChatMessage, Conversation } from '../../client/features/customer/messages/types';
import { useChatWebSocket } from '../../client/features/customer/messages/hooks/useChatWebSocket';
import { useChatInboxStore } from '../../stores/chatInboxStore';
import { isSupportPlaceholderUserId, SUPPORT_PLACEHOLDER_USER_ID } from '../../config/chat';
import { useResolvedChatUserId } from '../../hooks/useResolvedChatUserId';
import { useAuthHydrated } from '../../hooks/useAuthHydrated';
import { SUPPORT_CHAT_SYNC_EVENT, emitSupportChatSync } from '../../client/features/customer/messages/supportChatSync';
import {
    appendUniqueMessage,
    applyDeleteEvent,
    applyEditEvent,
    applyReactionEvent,
    buildChatMessageFromWs,
    parseMediaUrls,
} from '../../client/features/customer/messages/utils/chatSyncUtils';
import {
    clearStoredSupportConversationId,
    getStoredSupportConversationId,
    setStoredSupportConversationId,
} from '../../client/features/customer/messages/supportConversationStorage';
import { AnimatePresence, motion } from 'framer-motion';

const STAFF_ASSIGN_FAILED_HINTS = [
    'không có nhân viên',
    'no staff available',
    'no admin accepted',
] as const;
const STAFF_ASSIGN_SUCCESS_HINTS = ['staff assigned', 'support assigned', 'đã tìm được', 'đã kết nối'] as const;
const LIST_FETCH_MIN_MS = 2000;
const MATCHING_TIMEOUT_MS = 40000;

function isAssignmentFailureText(text: string | null | undefined): boolean {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return STAFF_ASSIGN_FAILED_HINTS.some((hint) => normalized.includes(hint));
}

function isAssignmentSuccessText(text: string | null | undefined): boolean {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return STAFF_ASSIGN_SUCCESS_HINTS.some((hint) => normalized.includes(hint));
}

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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [isSendingImages, setIsSendingImages] = useState(false);

    const authHydrated = useAuthHydrated();
    const { chatUserId: currentUserId, identityReady } = useResolvedChatUserId();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    /** Avoid hammering GET /conversations on every CONVERSATION_ACTIVITY / reconnect. */
    const lastListFetchAtRef = useRef(0);
    /** Always current — `loadSupportThread` must not read stale `conversation` from closure. */
    const conversationIdRef = useRef<string | null>(null);
    /** Prevent spamming backend rematch when the same placeholder thread is reloaded. */
    const lastSupportRematchAtRef = useRef<Record<string, number>>({});
    const matchingTimeoutShownRef = useRef<Record<string, true>>({});
    const matchingDismissedRef = useRef<Record<string, true>>({});

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

    const lastConversationEvent = useChatInboxStore((s) => s.lastInboxEvent);

    const { lastMessage, lastEdited, lastDeleted, lastReaction } = useChatWebSocket({
        conversationId: conversation?.conversationId ?? null,
        userId: currentUserId,
        onReconnect: reloadMessages,
        subscribeInbox: false,
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
                    } else if (match && isAssignmentSuccessText(match.lastMessage)) {
                        setConversation(match);
                        setIsMatching(false);
                    } else if (match && isAssignmentFailureText(match.lastMessage)) {
                        setConversation(match);
                        setIsMatching(false);
                    } else if (isAssignmentSuccessText(lastConversationEvent.lastMessage)) {
                        setIsMatching(false);
                        setMessages((prev) => {
                            if (prev.some((m) => isAssignmentSuccessText(m.content))) return prev;
                            return [
                                ...prev,
                                {
                                    messageId: `local-assigned-${conversation?.conversationId ?? 'support'}`,
                                    conversationId: conversation?.conversationId ?? 'support',
                                    content: 'Da ket noi voi nhan vien ho tro. Ban co the nhan tin ngay bay gio.',
                                    messageType: 'SYSTEM',
                                    sentAt: new Date().toISOString(),
                                    isRead: true,
                                    isDeleted: false,
                                },
                            ];
                        });
                    } else if (isAssignmentFailureText(lastConversationEvent.lastMessage)) {
                        setIsMatching(false);
                    }
                    // Conversation-level events can arrive before chat-topic subscription is ready.
                    // Refetching history guarantees system messages (e.g. no staff available) are visible.
                    await reloadMessages();
                } catch (err) {
                    console.error('Failed to update conversation after assignment:', err);
                }
            };
            updateChat();
        }
    }, [lastConversationEvent, conversation, reloadMessages]);

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

    // Defensive fallback: if backend never emits assignment result, stop infinite "Finding a specialist..."
    useEffect(() => {
        const activeConversationId = conversation?.conversationId;
        if (!isMatching || !activeConversationId) return;
        if (!isSupportPlaceholderUserId(conversation?.otherUser?.userId)) return;

        const timer = window.setTimeout(() => {
            setIsMatching(false);
            matchingDismissedRef.current[activeConversationId] = true;
            if (matchingTimeoutShownRef.current[activeConversationId]) return;
            matchingTimeoutShownRef.current[activeConversationId] = true;

            setMessages((prev) => {
                if (prev.some((m) => isAssignmentFailureText(m.content))) return prev;
                return [
                    ...prev,
                    {
                        messageId: `local-timeout-${activeConversationId}`,
                        conversationId: activeConversationId,
                        content: 'No support staff accepted yet. Please leave a message and we will respond soon.',
                        messageType: 'SYSTEM',
                        sentAt: new Date().toISOString(),
                        isRead: true,
                        isDeleted: false,
                    },
                ];
            });
        }, MATCHING_TIMEOUT_MS);

        return () => window.clearTimeout(timer);
    }, [isMatching, conversation?.conversationId, conversation?.otherUser?.userId]);

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
                const orderedHistory = history.slice().reverse();
                setMessages(orderedHistory);
                const placeholderConversation = isSupportPlaceholderUserId(conv.otherUser?.userId);
                const hasStaffReply = orderedHistory.some((m) => {
                    const senderId = m.sender?.userId;
                    return (
                        !!senderId &&
                        senderId !== currentUserId &&
                        !isSupportPlaceholderUserId(senderId) &&
                        m.messageType !== 'SYSTEM'
                    );
                });
                setIsMatching(
                    placeholderConversation &&
                        !isAssignmentFailureText(conv.lastMessage) &&
                        !isAssignmentSuccessText(conv.lastMessage) &&
                        !hasStaffReply &&
                        !matchingDismissedRef.current[conv.conversationId],
                );

                // If we loaded an existing placeholder support thread, force a rematch on the BE side.
                // This fixes the case where BE rematch only happens in POST /conversations, but FE would otherwise only GET.
                if (
                    placeholderConversation &&
                    !isAssignmentFailureText(conv.lastMessage) &&
                    !isAssignmentSuccessText(conv.lastMessage) &&
                    !hasStaffReply &&
                    !matchingDismissedRef.current[conv.conversationId]
                ) {
                    const convId = conv.conversationId;
                    const now = Date.now();
                    const cooldownMs = 20000;
                    const lastAt = lastSupportRematchAtRef.current[convId] ?? 0;
                    if (now - lastAt > cooldownMs) {
                        lastSupportRematchAtRef.current[convId] = now;
                        void messageService
                            .createConversation(SUPPORT_PLACEHOLDER_USER_ID, true)
                            .catch(() => {
                                /* ignore: rematch will still be handled via WS */
                            });
                    }
                }
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
                return appendUniqueMessage(prev, buildChatMessageFromWs(lastMessage));
            });

            if (lastMessage.messageType === 'SYSTEM') {
                const c = (lastMessage.content || '').toLowerCase();
                if (isAssignmentFailureText(c)) {
                    setIsMatching(false);
                    matchingDismissedRef.current[conversation.conversationId] = true;
                }
            }

            if (
                currentUserId != null &&
                !isSupportPlaceholderUserId(lastMessage.senderId) &&
                lastMessage.senderId !== currentUserId
            ) {
                setIsMatching(false);
                matchingDismissedRef.current[conversation.conversationId] = true;
            }
        }
    }, [lastMessage, conversation, currentUserId]);

    useEffect(() => {
        if (!lastEdited || !conversation) return;
        setMessages((prev) => applyEditEvent(prev, lastEdited));
    }, [lastEdited, conversation]);

    useEffect(() => {
        if (!lastDeleted || !conversation) return;
        setMessages((prev) => applyDeleteEvent(prev, lastDeleted));
    }, [lastDeleted, conversation]);

    useEffect(() => {
        if (!lastReaction || !conversation) return;
        setMessages((prev) => applyReactionEvent(prev, lastReaction));
    }, [lastReaction, conversation]);

    const handleSend = async () => {
        if (!input.trim() || loading || isCreatingChat) return;
        const text = input;
        setInput('');
        setLoading(true);

        try {
            let activeConv = conversation;
            const hadExistingConversation = !!activeConv;

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
            if (hadExistingConversation && isMatching) {
                setIsMatching(false);
                matchingDismissedRef.current[activeConv!.conversationId] = true;
            }
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

    const handleDeleteMessage = async (messageId: string) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await messageService.deleteMessage(messageId);
            setMessages((prev) => applyDeleteEvent(prev, { messageId }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditMessage = async (messageId: string, content: string) => {
        const next = window.prompt('Edit message', content);
        if (!next || next.trim() === '' || next === content) return;
        try {
            await messageService.editMessage(messageId, next);
            setMessages((prev) => applyEditEvent(prev, { messageId, newContent: next }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        try {
            await messageService.addReaction(messageId, emoji);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;
        setSelectedImages(files.slice(0, 8));
        setShowImagePreview(true);
        event.target.value = '';
    };

    const handleSendImages = async () => {
        if (!conversation || selectedImages.length === 0 || isSendingImages) return;
        setIsSendingImages(true);
        try {
            await messageService.uploadImages(conversation.conversationId, selectedImages);
            setSelectedImages([]);
            setShowImagePreview(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSendingImages(false);
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
                                            className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm group ${
                                                isMe
                                                    ? 'bg-red-500 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}
                                        >
                                            {msg.isDeleted ? (
                                                <p className="italic opacity-70">Message deleted</p>
                                            ) : msg.messageType === 'IMAGE' ? (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {parseMediaUrls(msg.mediaUrl).map((url, imageIndex) => (
                                                            <a
                                                                key={`${rowKey}-img-${imageIndex}`}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Chat image ${imageIndex + 1}`}
                                                                    className="rounded-lg object-cover w-full h-24"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                    {msg.content ? <p>{msg.content}</p> : null}
                                                </div>
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                            {msg.editedAt && !msg.isDeleted && (
                                                <p className="text-[10px] opacity-70 mt-1">edited</p>
                                            )}
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                                                        <span
                                                            key={`${rowKey}-${emoji}`}
                                                            className="rounded-full bg-white/90 text-gray-700 px-2 py-0.5 text-[10px]"
                                                        >
                                                            {emoji} {users.length}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-2 flex items-center gap-2">
                                                {!isMe && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleAddReaction(msg.messageId, '❤️')}
                                                        className="text-[10px] hover:scale-125 transition-transform"
                                                    >
                                                        ❤️
                                                    </button>
                                                )}
                                                {isMe && !msg.isDeleted && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleEditMessage(msg.messageId, msg.content)}
                                                            className="text-[10px] opacity-80 hover:opacity-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDeleteMessage(msg.messageId)}
                                                            className="text-[10px] opacity-80 hover:opacity-100"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    className="p-2 text-gray-500 hover:text-red-500"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFilesSelected}
                                />
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

            {showImagePreview && selectedImages.length > 0 && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">
                                Send {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImagePreview(false);
                                    setSelectedImages([]);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[50vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {selectedImages.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== index))}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImagePreview(false);
                                    setSelectedImages([]);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSendingImages || selectedImages.length === 0}
                                onClick={() => void handleSendImages()}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-sm"
                            >
                                {isSendingImages ? 'Sending...' : 'Send images'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
