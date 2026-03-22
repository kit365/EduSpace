import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { 
    Send, Search, MoreVertical, Paperclip, Smile, Loader2, 
    User, Image as ImageIcon, FileText, Download, Filter,
    CheckCheck, Clock, ShieldCheck, ChevronRight, X, Share2, RefreshCw
} from 'lucide-react';
import { messageService } from '../../../../client/features/customer/messages/services/messageService';
import { useConversations } from '../../../../client/features/customer/messages/hooks/useMessages';
import { useChatWebSocket } from '../../../../client/features/customer/messages/hooks/useChatWebSocket';
import type { ChatMessage, Conversation, SearchUserResult } from '../../../../client/features/customer/messages/types';
import { SUPPORT_PLACEHOLDER_USER_ID } from '../../../../config/chat';
import { useResolvedChatUserId } from '../../../../hooks/useResolvedChatUserId';

export function AdminMessagesPage() {
    const { conversations, loading, setConversations } = useConversations('admin');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { chatUserId: currentUserId } = useResolvedChatUserId();

    /** Unassigned support threads notify `/topic/user/{placeholder}/conversations` only. */
    const adminInboxExtraTopics = useMemo(() => [SUPPORT_PLACEHOLDER_USER_ID] as const, []);

    const reloadMessages = useCallback(async () => {
        if (!selectedConversation) return;
        try {
            const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
            setMessages(history.slice().reverse());
        } catch (err) {
            console.error(err);
        }
    }, [selectedConversation]);

    const { lastMessage, lastConversationEvent, lastReadReceipt } = useChatWebSocket({
        conversationId: selectedConversation?.conversationId ?? null,
        userId: currentUserId,
        extraInboxUserIds: adminInboxExtraTopics,
        onReconnect: reloadMessages,
    });
 
    const [activeTab, setActiveTab] = useState<'my' | 'queue'>('my');
    const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([]);
    const [isClaiming, setIsClaiming] = useState(false);
 
    // Transfer logic
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [onlineStaff, setOnlineStaff] = useState<SearchUserResult[]>([]);
    const [transferLoading, setTransferLoading] = useState(false);
 
    const loadQueue = useCallback(async () => {
        try {
            const data = await messageService.getUnassignedConversations();
            setUnassignedConversations(data);
        } catch (err) {
            console.error('Failed to load queue:', err);
        }
    }, []);
 
    const loadOnlineStaff = useCallback(async () => {
        try {
            setTransferLoading(true);
            const profiles = await messageService.getOnlineSupportStaffProfiles();
            // Filter out current user
            setOnlineStaff(profiles.filter(p => p.keycloakId !== currentUserId));
        } catch (err) {
            console.error('Failed to load online staff:', err);
        } finally {
            setTransferLoading(false);
        }
    }, [currentUserId]);
 
    useEffect(() => {
        if (isTransferModalOpen) {
            loadOnlineStaff();
        }
    }, [isTransferModalOpen, loadOnlineStaff]);
 
    useEffect(() => {
        if (activeTab === 'queue') {
            loadQueue();
        }
    }, [activeTab, loadQueue]);
 
    const handleClaim = async (conversationId: string) => {
        if (isClaiming) return;
        setIsClaiming(true);
        try {
            const conv = await messageService.claimConversation(conversationId);
            setConversations(prev => [conv, ...prev]);
            setUnassignedConversations(prev => prev.filter(c => c.conversationId !== conversationId));
            setSelectedConversation(conv);
            setActiveTab('my');
        } catch (err) {
            console.error('Claim failed:', err);
        } finally {
            setIsClaiming(false);
        }
    };
 
    const handleTransfer = async (targetAdminId: string) => {
        if (!selectedConversation) return;
        try {
            await messageService.transferConversation(selectedConversation.conversationId, targetAdminId);
            setConversations(prev => prev.filter(c => c.conversationId !== selectedConversation.conversationId));
            setSelectedConversation(null);
            setIsTransferModalOpen(false);
            alert('Cuộc trò chuyện đã được chuyển.');
        } catch (err) {
            console.error('Transfer failed:', err);
            alert('Chuyển cuộc trò chuyện thất bại.');
        }
    };
 
    const handleRequeue = async () => {
        if (!selectedConversation) return;
        try {
            await messageService.requeueConversation(selectedConversation.conversationId);
            setConversations(prev => prev.filter(c => c.conversationId !== selectedConversation.conversationId));
            setSelectedConversation(null);
            alert('Cuộc trò chuyện đã được đưa về hàng chờ.');
        } catch (err) {
            console.error('Requeue failed:', err);
        }
    };

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
            if (prev.some(m => m.messageId === lastMessage.messageId)) return prev;
            return [
            ...prev,
            {
                messageId: lastMessage.messageId,
                conversationId: lastMessage.conversationId,
                content: lastMessage.content,
                messageType: lastMessage.messageType,
                sentAt: lastMessage.sentAt,
                isRead: false,
                isDeleted: false,
                mediaUrl: lastMessage.mediaUrl ?? null,
                mediaType: null,
                readAt: null,
                editedAt: null,
                reactions: null,
                replyToMessageId: null,
                sender: lastMessage.senderId ? {
                    userId: lastMessage.senderId,
                    fullName: lastMessage.senderUsername ?? 'Staff',
                    email: lastMessage.senderEmail ?? null,
                    avatarUrl: null
                } : null
            }
        ]});
    }, [lastMessage, selectedConversation]);

    // Real-time conversation list updates
    useEffect(() => {
        if (!lastConversationEvent) return;

        setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.conversationId === lastConversationEvent.conversationId);
            const isActiveChat = activeChatIdRef.current === lastConversationEvent.conversationId;
            const msgIsFromMe =
                currentUserId != null && lastConversationEvent.senderId === currentUserId;

            if (existingIndex >= 0) {
                const updated = [...prev];
                const existing = updated[existingIndex];
                
                updated[existingIndex] = {
                    ...existing,
                    lastMessage: lastConversationEvent.messageType === 'IMAGE' ? '[Image]' : lastConversationEvent.lastMessage,
                    lastActivity: lastConversationEvent.lastActivity,
                    unreadCount: (isActiveChat || msgIsFromMe) 
                        ? 0 
                        : (existing.unreadCount || 0) + 1
                };
                
                // Move to top
                const [chat] = updated.splice(existingIndex, 1);
                updated.unshift(chat);
                return updated;
            }
            void messageService.getAdminConversations().then(setConversations).catch(console.error);
            return prev;
        });
    }, [lastConversationEvent, currentUserId, setConversations]);

    // Handle Read Receipts
    useEffect(() => {
        if (!lastReadReceipt) return;
        
        setConversations(prev => prev.map(c => 
            c.conversationId === lastReadReceipt.conversationId 
                ? { ...c, unreadCount: 0 } 
                : c
        ));
    }, [lastReadReceipt, setConversations]);

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

    const filteredConversations = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        const base = activeTab === 'my' ? conversations : unassignedConversations;
        if (!q) return base;
        return base.filter((c) => {
            const name = (c.otherUser?.fullName ?? '').toLowerCase();
            const last = (c.lastMessage ?? '').toLowerCase();
            const title = (c.conversationName ?? '').toLowerCase();
            return name.includes(q) || last.includes(q) || title.includes(q);
        });
    }, [conversations, unassignedConversations, searchTerm, activeTab]);
 
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
                            <h2 className="text-xl font-bold text-gray-900">Support</h2>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setActiveTab('my')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'my' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    My Chats
                                </button>
                                <button 
                                    onClick={() => setActiveTab('queue')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${activeTab === 'queue' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Queue
                                    {unassignedConversations.length > 0 && (
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={activeTab === 'my' ? "Search contacts..." : "Search queue..."}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {filteredConversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Clock className="w-10 h-10 text-gray-200 mb-2" />
                                <p className="text-xs text-gray-400 font-medium tracking-tight">
                                    {activeTab === 'my' ? 'No active conversations.' : 'No pending support requests.'}
                                </p>
                            </div>
                        )}
                        {filteredConversations.map((chat) => {
                            const active = selectedConversation?.conversationId === chat.conversationId;
                            return (
                                <div 
                                    key={chat.conversationId}
                                    onClick={() => activeTab === 'my' && setSelectedConversation(chat)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border ${
                                        active ? 'bg-blue-50/50 border-blue-100' : 'hover:bg-gray-50 border-transparent'
                                    }`}
                                >
                                    <div className="relative">
                                        <img 
                                            src={chat.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.otherUser?.fullName || 'Guest'}`}
                                            className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm"
                                            alt=""
                                        />
                                        {activeTab === 'my' && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
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
                                            {chat.lastMessage?.trim() ? chat.lastMessage : 'Wait for assignment...'}
                                        </p>
                                    </div>
                                    {activeTab === 'my' && chat.unreadCount > 0 && (
                                        <div className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                    {activeTab === 'queue' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleClaim(chat.conversationId); }}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                        >
                                            Pick
                                        </button>
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
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsTransferModalOpen(true)}
                                        title="Transfer to another staff"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all text-xs font-bold border border-gray-100 hover:border-blue-100"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Transfer
                                    </button>
                                    <button 
                                        onClick={handleRequeue}
                                        title="Return to queue"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all text-xs font-bold border border-gray-100 hover:border-red-100"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Re-queue
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

                            {/* Input area */}
                            <div className="p-6 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 focus-within:border-blue-200 focus-within:bg-white transition-all shadow-sm">
                                    <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
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
 
            {/* 3. Transfer Modal */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Transfer</h2>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Hand over to another online staff</p>
                            </div>
                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
 
                        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                            {transferLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                    <p className="text-sm font-bold text-gray-900">Finding online staff...</p>
                                </div>
                            ) : onlineStaff.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <RefreshCw className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">No other staff online</p>
                                    <p className="text-xs text-gray-500 mt-1">Try re-queueing instead.</p>
                                </div>
                            ) : (
                                onlineStaff.map(staff => (
                                    <div 
                                        key={staff.keycloakId}
                                        onClick={() => handleTransfer(staff.keycloakId)}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-100 group"
                                    >
                                        <img 
                                            src={staff.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.fullName}`}
                                            className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm"
                                            alt=""
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {staff.fullName}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available</span>
                                            </div>
                                        </div>
                                        <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all text-blue-600">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
 
                        <div className="p-6 bg-gray-50/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-all"
                            >
                                Cancel
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
