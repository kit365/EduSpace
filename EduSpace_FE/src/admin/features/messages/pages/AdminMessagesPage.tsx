import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { 
    Send, Search, MoreVertical, Paperclip, Smile, Loader2, 
    User, Image as ImageIcon, FileText, Download, Filter,
    CheckCheck, Clock, ShieldCheck, ChevronRight, X, Video
} from 'lucide-react';
import { messageService } from '../../../../client/features/customer/messages/services/messageService';
import { useConversations } from '../../../../client/features/customer/messages/hooks/useMessages';
import { useChatWebSocket } from '../../../../client/features/customer/messages/hooks/useChatWebSocket';
import type { AssignmentOfferEvent, ChatMessage, Conversation } from '../../../../client/features/customer/messages/types';
import { useResolvedChatUserId } from '../../../../hooks/useResolvedChatUserId';
import { useChatInboxStore } from '../../../../stores/chatInboxStore';
import {
    appendUniqueMessage,
    applyConversationActivity,
    applyDeleteEvent,
    applyEditEvent,
    applyReactionEvent,
    applyReadReceiptEvent,
    buildChatMessageFromWs,
    parseMediaUrls,
} from '../../../../client/features/customer/messages/utils/chatSyncUtils';
import { useVideoCall } from '../../../../contexts/VideoCallContext';

const parseOfferExpiryMs = (expiresAt: string): number => {
    if (!expiresAt) return 0;
    // Java LocalDateTime is sent without timezone. Treat it as UTC to avoid
    // instant-expired UI when browser timezone differs from backend timezone.
    const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(expiresAt);
    const normalized = hasTimezone ? expiresAt : `${expiresAt}Z`;
    const parsed = Date.parse(normalized);
    return Number.isNaN(parsed) ? Date.parse(expiresAt) : parsed;
};

export function AdminMessagesPage() {
    const { conversations, loading, setConversations } = useConversations('admin');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [isSendingImages, setIsSendingImages] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { chatUserId: currentUserId } = useResolvedChatUserId();
    const { initiateCall, activeCall } = useVideoCall();

    const pendingOffers = useChatInboxStore((s) => s.pendingAssignmentOffers);
    const clearPendingAssignmentOffer = useChatInboxStore((s) => s.clearPendingAssignmentOffer);

    const reloadMessages = useCallback(async () => {
        if (!selectedConversation) return;
        try {
            const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
            setMessages(history.slice().reverse());
        } catch (err) {
            console.error(err);
        }
    }, [selectedConversation]);

    const lastConversationEvent = useChatInboxStore((s) => s.lastInboxEvent);

    const { lastMessage, lastReadReceipt, lastEdited, lastDeleted, lastReaction } = useChatWebSocket({
        conversationId: selectedConversation?.conversationId ?? null,
        userId: currentUserId,
        onReconnect: reloadMessages,
        subscribeInbox: false,
    });

    const activeChatIdRef = useRef<string | null>(null);

    useEffect(() => {
        activeChatIdRef.current = selectedConversation?.conversationId ?? null;
        
        // Clear unread count locally when selecting
        if (selectedConversation) {
            setConversations(prev => prev.map(c => 
                c.conversationId === selectedConversation.conversationId 
                    ? { ...c, unreadCount: 0 } 
                    : c
            ));
        }
    }, [selectedConversation, setConversations]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Initial select
    useEffect(() => {
        if (!selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [conversations, selectedConversation]);

    // Load messages
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
        load();
    }, [selectedConversation]);

    // Real-time messages for active chat
    useEffect(() => {
        if (!lastMessage || !selectedConversation) return;
        if (lastMessage.conversationId !== selectedConversation.conversationId) return;

        setMessages((prev) => {
            return appendUniqueMessage(prev, buildChatMessageFromWs(lastMessage));
        });
    }, [lastMessage, selectedConversation]);

    // Real-time conversation list updates (inbox events from global ChatInboxNotificationBridge)
    useEffect(() => {
        if (!lastConversationEvent || lastConversationEvent.type !== 'CONVERSATION_ACTIVITY') return;

        setConversations((prev) => {
            const next = applyConversationActivity(prev, lastConversationEvent, {
                activeConversationId: activeChatIdRef.current,
                currentUserId,
            });
            if (next !== prev) return next;
            void messageService.getAdminConversations().then(setConversations).catch(console.error);
            return prev;
        });
    }, [lastConversationEvent, currentUserId, setConversations]);

    useEffect(() => {
        if (!lastConversationEvent || lastConversationEvent.type !== 'ASSIGNMENT_OFFER') return;
        void messageService.getAdminConversations().then(setConversations).catch(console.error);
    }, [lastConversationEvent, setConversations]);

    const handleAcceptOffer = async (offer: AssignmentOfferEvent) => {
        try {
            const updated = await messageService.acceptAssignmentOffer(offer.conversationId, offer.offerId);
            setConversations((prev) =>
                prev.map((c) => (c.conversationId === updated.conversationId ? updated : c)),
            );
            if (selectedConversation?.conversationId === updated.conversationId) {
                setSelectedConversation(updated);
            }
            clearPendingAssignmentOffer(offer.conversationId);
        } catch (err) {
            console.error('Failed to accept assignment offer', err);
        }
    };

    const handleDeclineOffer = (offer: AssignmentOfferEvent) => {
        clearPendingAssignmentOffer(offer.conversationId);
    };

    useEffect(() => {
        if (!lastEdited) return;
        setMessages((prev) => applyEditEvent(prev, lastEdited));
    }, [lastEdited]);

    useEffect(() => {
        if (!lastDeleted) return;
        setMessages((prev) => applyDeleteEvent(prev, lastDeleted));
    }, [lastDeleted]);

    useEffect(() => {
        if (!lastReaction) return;
        setMessages((prev) => applyReactionEvent(prev, lastReaction));
    }, [lastReaction]);

    // Handle Read Receipts
    useEffect(() => {
        if (!lastReadReceipt) return;
        setMessages((prev) => applyReadReceiptEvent(prev, lastReadReceipt, currentUserId));
        setConversations(prev => prev.map(c => 
            c.conversationId === lastReadReceipt.conversationId 
                ? { ...c, unreadCount: 0 } 
                : c
        ));
    }, [lastReadReceipt, setConversations, currentUserId]);

    const handleSend = async () => {
        if (!messageInput.trim() || !selectedConversation) return;
        try {
            const txt = messageInput;
            setMessageInput('');
            const newMsg = await messageService.sendText(selectedConversation.conversationId, txt);
            setMessages((prev) => {
                if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
                return [...prev, newMsg];
            });
        } catch (err) {
            console.error(err);
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
        if (!selectedConversation || selectedImages.length === 0 || isSendingImages) return;
        setIsSendingImages(true);
        try {
            await messageService.uploadImages(selectedConversation.conversationId, selectedImages);
            setSelectedImages([]);
            setShowImagePreview(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSendingImages(false);
        }
    };

    const filteredConversations = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter((c) => {
            const name = (c.otherUser?.fullName ?? '').toLowerCase();
            const last = (c.lastMessage ?? '').toLowerCase();
            const title = (c.conversationName ?? '').toLowerCase();
            return name.includes(q) || last.includes(q) || title.includes(q);
        });
    }, [conversations, searchTerm]);

    if (loading) {
        return (
            <AdminLayout title="Messages">
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Messages">
            <div className="h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-100 shadow-sm flex overflow-hidden">
                
                {/* 1. Conversations Sidebar */}
                <div className="w-80 border-r border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Chats</h2>
                            <button className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                                <Filter className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {conversations.length > 0 && filteredConversations.length === 0 && (
                            <p className="text-xs text-center text-gray-400 px-2 py-6">
                                Không có cuộc trò chuyện khớp tìm kiếm.
                            </p>
                        )}
                        {filteredConversations.map((chat) => {
                            const active = selectedConversation?.conversationId === chat.conversationId;
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
                                            src={chat.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.otherUser?.fullName}`}
                                            className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm"
                                            alt=""
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className={`text-sm font-bold truncate ${active ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {chat.otherUser?.fullName ?? chat.conversationName ?? 'Guest'}
                                            </h4>
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {chat.lastActivity ? new Date(chat.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate font-medium">
                                            {chat.lastMessage?.trim() ? chat.lastMessage : '—'}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <div className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Main Chat Window */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                        className="w-10 h-10 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                        alt=""
                                        onClick={() => setSidebarOpen(true)}
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            {selectedConversation.otherUser?.fullName ??
                                                selectedConversation.conversationName ??
                                                'Guest'}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span>
                                        </div>
                                    </div>
                                </div>
                                {(() => {
                                    const offer = pendingOffers[selectedConversation.conversationId];
                                    if (!offer) return null;
                                    const expired = parseOfferExpiryMs(offer.expiresAt) <= Date.now();
                                    return (
                                        <div className="ml-4 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50">
                                            <p className="text-xs font-semibold text-amber-800">
                                                Support offer pending
                                            </p>
                                            <button
                                                type="button"
                                                disabled={expired}
                                                onClick={() => void handleAcceptOffer(offer)}
                                                className="mt-1 px-2 py-1 text-xs rounded-md bg-amber-600 text-white disabled:opacity-50"
                                            >
                                                {expired ? 'Offer expired' : 'Accept'}
                                            </button>
                                            {!expired && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeclineOffer(offer)}
                                                    className="mt-1 ml-2 px-2 py-1 text-xs rounded-md border border-amber-400 text-amber-800"
                                                >
                                                    Decline
                                                </button>
                                            )}
                                        </div>
                                    );
                                })()}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void initiateCall(selectedConversation.conversationId)}
                                        disabled={!!activeCall}
                                        className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all border border-transparent hover:border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={activeCall ? 'A call is already in progress' : 'Start video call'}
                                    >
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
                            >
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
                                                    src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                                    className="w-8 h-8 rounded-lg mr-3 self-end shadow-sm"
                                                    alt=""
                                                />
                                            )}
                                            <div className={`max-w-[70%] group relative`}>
                                                <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                                                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                                }`}>
                                                    {m.isDeleted ? (
                                                        <p className="italic opacity-70">Message deleted</p>
                                                    ) : m.messageType === 'IMAGE' ? (
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-2 gap-1">
                                                                {parseMediaUrls(m.mediaUrl).map((url, imageIndex) => (
                                                                    <a
                                                                        key={`${m.messageId}-image-${imageIndex}`}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <img
                                                                            src={url}
                                                                            alt={`Message image ${imageIndex + 1}`}
                                                                            className="rounded-lg object-cover w-full h-24"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                            {m.content ? <p>{m.content}</p> : null}
                                                        </div>
                                                    ) : (
                                                        <p>{m.content}</p>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {m.editedAt && <span className="text-[10px] font-bold text-gray-300">edited</span>}
                                                    {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                                    {!isMe && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleAddReaction(m.messageId, '❤️')}
                                                            className="text-[10px] hover:scale-125 transition-transform"
                                                        >
                                                            ❤️
                                                        </button>
                                                    )}
                                                </div>
                                                {m.reactions && Object.keys(m.reactions).length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {Object.entries(m.reactions).map(([emoji, users]) => (
                                                            <span
                                                                key={`${m.messageId}-${emoji}`}
                                                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
                                                            >
                                                                {emoji} {users.length}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {isMe && !m.isDeleted && (
                                                    <div className="mt-1 flex gap-2 justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleEditMessage(m.messageId, m.content)}
                                                            className="text-[10px] text-slate-500 hover:text-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDeleteMessage(m.messageId)}
                                                            className="text-[10px] text-slate-500 hover:text-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input area */}
                            <div className="p-6 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 focus-within:border-blue-200 focus-within:bg-white transition-all shadow-sm">
                                    <button
                                        type="button"
                                        onClick={handleUploadClick}
                                        className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                                    >
                                        <Paperclip className="w-5 h-5" />
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
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300"
                                    />
                                    <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={handleSend}
                                        disabled={!messageInput.trim()}
                                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:grayscale"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-50">
                             <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mb-6">
                                <Send className="w-10 h-10 text-blue-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Message</h3>
                            <p className="text-sm font-medium text-gray-400 max-w-xs">Pick a conversation from the left to start communicating with customers and hosts.</p>
                        </div>
                    )}
                </div>

                {/* 3. Media & Info Sidebar */}
                <div className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out border-l border-gray-100 ${sidebarOpen ? 'w-72 overflow-y-auto custom-scrollbar' : 'w-0'}`}>
                    {selectedConversation ? (
                        <div className="p-8 w-72">
                            {/* Back Button */}
                            <button 
                                onClick={() => setSidebarOpen(false)}
                                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                                <span className="text-sm font-semibold">Back</span>
                            </button>
                            
                            <div className="text-center mb-10">
                                <img 
                                    src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                    className="w-24 h-24 rounded-3xl mx-auto mb-4 border-4 border-gray-50 shadow-md"
                                    alt=""
                                />
                                <h3 className="text-lg font-black text-gray-900">{selectedConversation.otherUser?.fullName}</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{selectedConversation.otherUser?.email}</p>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Media (0)</h4>
                                        <button className="text-[10px] font-black text-blue-600 hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="aspect-square bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-gray-200" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Settings</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Verify Identity</p>
                                                <p className="text-[10px] font-medium text-gray-400">Check KYC status</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                                            <Clock className="w-5 h-5 text-amber-500" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Chat History</p>
                                                <p className="text-[10px] font-medium text-gray-400">Full logs backup</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-10 text-center w-72">
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest leading-relaxed">Select a user to view their profile and attachments</p>
                        </div>
                    )}
                </div>
            </div>

            {showImagePreview && selectedImages.length > 0 && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">
                                Send {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImagePreview(false);
                                    setSelectedImages([]);
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-5 max-h-[65vh] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedImages.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full aspect-square object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== index))}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImagePreview(false);
                                    setSelectedImages([]);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSendingImages || selectedImages.length === 0}
                                onClick={() => void handleSendImages()}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSendingImages ? 'Sending...' : 'Send images'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            ` }} />
        </AdminLayout>
    );
}
