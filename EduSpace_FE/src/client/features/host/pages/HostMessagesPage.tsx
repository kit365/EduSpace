import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Send, CheckCheck } from 'lucide-react';
import type { ChatMessage, Conversation, SearchUserResult, WebSocketMessagePayload } from '../../customer/messages/types';
import { messageService } from '../../customer/messages/services/messageService';
import { useConversations } from '../../customer/messages/hooks/useMessages';
import { useChatWebSocket } from '../../customer/messages/hooks/useChatWebSocket';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useResolvedChatUserId } from '@/hooks/useResolvedChatUserId';
import { useAuthStore } from '@/stores/authStore';
import { useChatInboxStore } from '@/stores/chatInboxStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';

function mapWsToChatMessage(payload: WebSocketMessagePayload, currentUserId: string | null): ChatMessage {
    // Map WebSocket payload -> ChatMessage UI model.
    return {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        content: payload.content,
        messageType: payload.messageType,
        sentAt: payload.sentAt,
        isRead: false,
        isDeleted: false,
        mediaUrl: payload.mediaUrl ?? null,
        mediaType: payload.mediaType ?? null,
        readAt: null,
        editedAt: null,
        reactions: null,
        replyToMessageId: null,
        sender: payload.senderId
            ? {
                  userId: payload.senderId,
                  fullName: payload.senderId === currentUserId ? 'Me' : undefined,
                  email: null,
                  avatarUrl: null,
              }
            : null,
    };
}

export function HostMessagesPage() {
    const { conversations, loading, setConversations } = useConversations('host');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatQuery, setNewChatQuery] = useState('');
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [startingConversation, setStartingConversation] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);

    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);

    const canManageMessages = hasHostPermission(
        accessToken,
        hostPermissions.messages.manage,
        hostPermissionsFromAccount,
    );

    const { chatUserId: currentUserId, identityReady } = useResolvedChatUserId();

    const activeChatIdRef = useRef<string | null>(null);
    const messagesScrollRef = useRef<HTMLDivElement | null>(null);

    const reloadMessages = useCallback(async () => {
        if (!selectedConversation) return;
        try {
            const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
            // API is usually newest-first; reverse to render oldest -> newest.
            setMessages(history.slice().reverse());
        } catch (err) {
            console.error(err);
        }
    }, [selectedConversation]);

    const lastConversationEvent = useChatInboxStore((s) => s.lastInboxEvent);

    const { lastMessage, lastReadReceipt } = useChatWebSocket({
        conversationId: selectedConversation?.conversationId ?? null,
        userId: currentUserId,
        onReconnect: reloadMessages,
        subscribeInbox: false,
    });

    useEffect(() => {
        activeChatIdRef.current = selectedConversation?.conversationId ?? null;

        // Clear unread count locally when selecting a conversation.
        if (selectedConversation) {
            setConversations((prev) =>
                prev.map((c) => (c.conversationId === selectedConversation.conversationId ? { ...c, unreadCount: 0 } : c)),
            );
        }
    }, [selectedConversation, setConversations]);

    useEffect(() => {
        if (messagesScrollRef.current) {
            messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Initial select.
    useEffect(() => {
        if (!selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [conversations, selectedConversation]);

    // Load messages when conversation changes.
    useEffect(() => {
        if (!selectedConversation) return;
        const load = async () => {
            try {
                const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
                setMessages(history.slice().reverse());
                await messageService.markRead(selectedConversation.conversationId);
            } catch (err) {
                console.error(err);
            }
        };
        void load();
    }, [selectedConversation]);

    // Append realtime lastMessage to current thread.
    useEffect(() => {
        if (!lastMessage || !selectedConversation) return;
        if (lastMessage.conversationId !== selectedConversation.conversationId) return;

        setMessages((prev) => {
            if (prev.some((m) => m.messageId === lastMessage.messageId)) return prev;
            return [...prev, mapWsToChatMessage(lastMessage, currentUserId)];
        });
    }, [lastMessage, selectedConversation, currentUserId]);

    // Update conversation list order + unread counts.
    useEffect(() => {
        if (!lastConversationEvent || lastConversationEvent.type !== 'CONVERSATION_ACTIVITY') return;

        setConversations((prev) => {
            const existingIndex = prev.findIndex((c) => c.conversationId === lastConversationEvent.conversationId);
            if (existingIndex < 0) {
                return prev;
            }

            const updated = [...prev];
            const existing = updated[existingIndex];

            const isActiveChat = activeChatIdRef.current === lastConversationEvent.conversationId;
            const msgIsFromMe = currentUserId != null && lastConversationEvent.senderId === currentUserId;

            updated[existingIndex] = {
                ...existing,
                lastMessage: lastConversationEvent.messageType === 'IMAGE' ? '[Image]' : lastConversationEvent.lastMessage,
                lastActivity: lastConversationEvent.lastActivity,
                unreadCount: isActiveChat || msgIsFromMe ? 0 : (existing.unreadCount || 0) + 1,
            };

            // Move to top.
            const [chat] = updated.splice(existingIndex, 1);
            updated.unshift(chat);
            return updated;
        });
    }, [lastConversationEvent, currentUserId, setConversations]);

    // Handle unread receipts.
    useEffect(() => {
        if (!lastReadReceipt) return;
        setConversations((prev) =>
            prev.map((c) => (c.conversationId === lastReadReceipt.conversationId ? { ...c, unreadCount: 0 } : c)),
        );
    }, [lastReadReceipt, setConversations]);

    const filteredConversations = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter((c) => {
            const name = (c.otherUser?.fullName ?? c.conversationName ?? '').toLowerCase();
            const last = (c.lastMessage ?? '').toLowerCase();
            return name.includes(q) || last.includes(q);
        });
    }, [conversations, searchTerm]);

    const canStartConversation = canManageMessages;

    useEffect(() => {
        const query = newChatQuery.trim();
        if (!canStartConversation || query.length < 2) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;
        const debounce = window.setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const found = await messageService.searchUsers(query, 8);
                if (!cancelled) {
                    setSearchResults(
                        found.filter((u) => u.keycloakId && u.keycloakId !== currentUserId).slice(0, 8),
                    );
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setSearchResults([]);
                }
            } finally {
                if (!cancelled) {
                    setSearchingUsers(false);
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(debounce);
        };
    }, [newChatQuery, canStartConversation, currentUserId]);

    const upsertConversation = useCallback(
        (conversation: Conversation) => {
            setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => c.conversationId === conversation.conversationId);
                if (existingIndex < 0) {
                    return [conversation, ...prev];
                }
                const next = [...prev];
                const existing = next[existingIndex];
                next.splice(existingIndex, 1);
                next.unshift({ ...existing, ...conversation });
                return next;
            });
            setSelectedConversation(conversation);
        },
        [setConversations],
    );

    const handleStartConversation = useCallback(
        async (candidate: SearchUserResult) => {
            if (!canStartConversation || startingConversation) return;
            if (!candidate?.keycloakId) return;

            setStartingConversation(true);
            try {
                const created = await messageService.createConversation(candidate.keycloakId, false);
                upsertConversation(created);
                setSearchResults([]);
                setNewChatQuery('');
            } catch (err) {
                console.error(err);
            } finally {
                setStartingConversation(false);
            }
        },
        [canStartConversation, startingConversation, upsertConversation],
    );

    const handleSend = async () => {
        if (!canManageMessages) return;
        if (!messageInput.trim() || !selectedConversation) return;

        const txt = messageInput;
        setMessageInput('');

        try {
            const newMsg = await messageService.sendText(selectedConversation.conversationId, txt);
            setMessages((prev) => {
                if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
                return [...prev, newMsg];
            });
        } catch (err) {
            console.error(err);
            // Restore input so user can retry.
            setMessageInput(txt);
        }
    };

    if (loading) {
        return (
            <RentalLayout title="Tin nhắn">
                <div className="h-[calc(100vh-140px)] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title="Tin nhắn">
            <div className="h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-100 shadow-sm flex overflow-hidden">
                {/* 1) Conversations sidebar */}
                <div className="w-80 border-r border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                        <div className="mt-3">
                            <input
                                type="text"
                                value={newChatQuery}
                                onChange={(e) => setNewChatQuery(e.target.value)}
                                placeholder={canStartConversation ? 'Start new conversation...' : 'Bạn không có quyền tạo hội thoại'}
                                disabled={!canStartConversation || startingConversation}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-60"
                            />
                            {canStartConversation && newChatQuery.trim().length >= 2 && (
                                <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-white">
                                    {searchingUsers ? (
                                        <div className="text-xs text-gray-500 px-3 py-2">Searching...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="text-xs text-gray-500 px-3 py-2">No users found.</div>
                                    ) : (
                                        searchResults.map((user) => (
                                            <button
                                                type="button"
                                                key={user.keycloakId}
                                                onClick={() => void handleStartConversation(user)}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 disabled:opacity-60"
                                                disabled={startingConversation}
                                            >
                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                    {user.fullName ?? user.email ?? user.keycloakId}
                                                </div>
                                                <div className="text-[11px] text-gray-400 truncate">{user.email ?? user.keycloakId}</div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {filteredConversations.length === 0 ? (
                            <p className="text-xs text-center text-gray-400 px-2 py-6">Không có cuộc trò chuyện.</p>
                        ) : (
                            filteredConversations.map((chat) => {
                                const active = selectedConversation?.conversationId === chat.conversationId;
                                const displayName = chat.otherUser?.fullName ?? chat.conversationName ?? 'Guest';
                                return (
                                    <div
                                        key={chat.conversationId}
                                        onClick={() => setSelectedConversation(chat)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${
                                            active ? 'bg-blue-50/50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={
                                                    chat.otherUser?.avatarUrl ??
                                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
                                                }
                                                className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm"
                                                alt=""
                                            />
                                            {chat.unreadCount > 0 && !active && (
                                                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className={`text-sm font-bold truncate ${active ? 'text-blue-700' : 'text-gray-900'}`}>
                                                    {displayName}
                                                </h4>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {chat.lastActivity
                                                        ? new Date(chat.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage ?? 'Start a conversation'}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2) Main chat */}
                <div className="flex-1 flex flex-col bg-slate-50/50">
                    {selectedConversation ? (
                        <>
                            <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4 min-w-0">
                                    <img
                                        src={
                                            selectedConversation.otherUser?.avatarUrl ??
                                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName ?? 'User'}`
                                        }
                                        className="w-11 h-11 rounded-xl object-cover shadow-sm"
                                        alt=""
                                    />
                                    <div className="min-w-0">
                                        <h2 className="font-black text-gray-900 text-[17px] truncate">
                                            {selectedConversation.otherUser?.fullName ?? selectedConversation.conversationName ?? 'Guest User'}
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {canManageMessages ? 'Manager' : 'View only'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                {messages.map((m) => {
                                    if (m.messageType === 'SYSTEM') {
                                        return (
                                            <div key={m.messageId} className="flex justify-center my-2">
                                                <span className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full font-medium italic max-w-[90%] text-center">
                                                    {m.content}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isMe = m.sender?.userId === currentUserId;

                                    return (
                                        <div key={m.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && (
                                                <img
                                                    src={
                                                        selectedConversation.otherUser?.avatarUrl ??
                                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName ?? 'User'}`
                                                    }
                                                    className="w-8 h-8 rounded-lg mr-3 self-end shadow-sm"
                                                    alt=""
                                                />
                                            )}
                                            <div className={`max-w-[70%]`}>
                                                <div
                                                    className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                                                        isMe
                                                            ? 'bg-blue-600 text-white rounded-br-none'
                                                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                                    }`}
                                                >
                                                    {m.content}
                                                </div>
                                                <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-50">
                                <div
                                    className={`flex items-center gap-3 bg-slate-50/50 p-3.5 rounded-[2rem] border border-slate-100 ${
                                        canManageMessages ? 'focus-within:border-blue-100 focus-within:bg-white' : 'opacity-60'
                                    } transition-all`}
                                >
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                void handleSend();
                                            }
                                        }}
                                        placeholder={canManageMessages ? 'Write your message...' : 'Bạn không có quyền gửi tin nhắn'}
                                        disabled={!canManageMessages}
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400 disabled:cursor-not-allowed"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => void handleSend()}
                                        disabled={!canManageMessages || !messageInput.trim()}
                                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:grayscale disabled:opacity-60"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                                {!identityReady && (
                                    <div className="text-xs text-gray-400 mt-2">Đang tải thông tin người dùng...</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-50">
                            <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chọn một cuộc trò chuyện</h3>
                            <p className="text-sm font-medium text-gray-400 max-w-xs">
                                Chọn từ danh sách bên trái để xem lịch sử và gửi tin nhắn.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </RentalLayout>
    );
}

