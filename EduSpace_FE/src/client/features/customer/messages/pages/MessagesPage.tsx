import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { 
    Send, Search, MoreVertical, Paperclip, Smile, Loader2, Headphones,
    Download, CheckCheck, Clock, X, ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConversations } from '../hooks/useMessages';
import { messageService } from '../services/messageService';
import type { ChatMessage, Conversation } from '../types';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { SUPPORT_PLACEHOLDER_USER_ID } from '../../../../../config/chat';
import { useResolvedChatUserId } from '../../../../../hooks/useResolvedChatUserId';
import { SUPPORT_CHAT_SYNC_EVENT, emitSupportChatSync } from '../supportChatSync';
import { setStoredSupportConversationId } from '../supportConversationStorage';

export function MessagesPage() {
    const { conversations, loading, setConversations, refetch } = useConversations('user');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isCreatingSupport, setIsCreatingSupport] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesScrollRef = useRef<HTMLDivElement | null>(null);
    const messagesBottomRef = useRef<HTMLDivElement | null>(null);
    const queryClient = useQueryClient();

    const { chatUserId: currentUserId } = useResolvedChatUserId();

    // Query to fetch messages - persisted in QueryClient cache
    const {
        data: messages = [],
        isLoading: messagesLoading,
        refetch: refetchMessages,
    } = useQuery({
        queryKey: ['messages', selectedConversation?.conversationId],
        queryFn: async () => {
            if (!selectedConversation) return [];
            const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
            return history.slice().reverse();
        },
        enabled: !!selectedConversation,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Mutation to send a message
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!selectedConversation) throw new Error('No conversation selected');
            return messageService.sendText(selectedConversation.conversationId, content);
        },
        onMutate: async (content: string) => {
            // Cancel outgoing refetches for messages
            await queryClient.cancelQueries({
                queryKey: ['messages', selectedConversation?.conversationId],
            });

            // Snapshot previous data
            const previousMessages = queryClient.getQueryData<ChatMessage[]>([
                'messages',
                selectedConversation?.conversationId,
            ]);

            // Optimistically update the cache with a temporary message
            if (selectedConversation) {
                queryClient.setQueryData<ChatMessage[]>(
                    ['messages', selectedConversation.conversationId],
                    (old) => [
                        ...(old ?? []),
                        {
                            messageId: `temp-${Date.now()}`,
                            conversationId: selectedConversation.conversationId,
                            content,
                            messageType: 'TEXT',
                            sentAt: new Date().toISOString(),
                            isRead: true,
                            isDeleted: false,
                            mediaUrl: null,
                            mediaType: null,
                            readAt: null,
                            editedAt: null,
                            reactions: null,
                            replyToMessageId: null,
                            sender: {
                                userId: currentUserId ?? '',
                                fullName: null,
                                email: null,
                                avatarUrl: null,
                            },
                        },
                    ]
                );
            }

            return { previousMessages };
        },
        onSuccess: () => {
            // Refetch messages to get the confirmed message from server
            void refetchMessages();
            emitSupportChatSync();
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousMessages && selectedConversation) {
                queryClient.setQueryData(
                    ['messages', selectedConversation.conversationId],
                    context.previousMessages
                );
            }
        },
    });

    const scrollMessagesToBottom = useCallback(() => {
        const pane = messagesScrollRef.current;
        if (pane) {
            pane.scrollTop = pane.scrollHeight;
        }
    }, []);

    const reloadMessages = useCallback(async () => {
        if (!selectedConversation) return;
        await refetchMessages();
    }, [selectedConversation, refetchMessages]);

    const { lastMessage } = useChatWebSocket({
        conversationId: selectedConversation?.conversationId ?? null,
        userId: currentUserId,
        onReconnect: reloadMessages,
    });

    useEffect(() => {
        if (!selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [conversations, selectedConversation]);

    useEffect(() => {
        if (!selectedConversation) return;
        // Mark as read
        void messageService.markRead(selectedConversation.conversationId);
    }, [selectedConversation]);

    /** Widget chat dùng cùng id — lưu để sau F5 GET /conversations lỡ trống vẫn restore được. */
    useEffect(() => {
        if (!currentUserId || !selectedConversation?.isAdminConversation) return;
        setStoredSupportConversationId(currentUserId, selectedConversation.conversationId);
    }, [currentUserId, selectedConversation?.conversationId, selectedConversation?.isAdminConversation]);

    useEffect(() => {
        const onSync = async () => {
            // Update conversation list (Sidebar) silently
            void refetch();
            
            // Only reload full history if specifically needed (e.g. initial state or re-sync)
            // For real-time messages, useChatWebSocket handles the append logic.
        };
        window.addEventListener(SUPPORT_CHAT_SYNC_EVENT, onSync);
        return () => window.removeEventListener(SUPPORT_CHAT_SYNC_EVENT, onSync);
    }, [refetch]);

    useEffect(() => {
        scrollMessagesToBottom();
    }, [messages, scrollMessagesToBottom]);

    // Prevent body scroll (Double Scrollbar fix)
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // (Simplified scroll: using useEffect on messages instead of MutationObserver)

    useEffect(() => {
        if (!lastMessage || !selectedConversation) return;
        if (lastMessage.conversationId !== selectedConversation.conversationId) return;

        // Convert WebSocket payload to ChatMessage and update cache
        const chatMessage: ChatMessage = {
            messageId: lastMessage.messageId,
            conversationId: lastMessage.conversationId,
            content: lastMessage.content,
            messageType: lastMessage.messageType || 'TEXT',
            sentAt: lastMessage.sentAt,
            isRead: false,
            isDeleted: false,
            mediaUrl: lastMessage.mediaUrl ?? null,
            mediaType: null,
            readAt: null,
            editedAt: null,
            reactions: null,
            replyToMessageId: null,
            sender: lastMessage.senderId
                ? {
                      userId: lastMessage.senderId,
                      fullName: lastMessage.senderUsername ?? null,
                      email: lastMessage.senderEmail ?? null,
                      avatarUrl: null,
                  }
                : null,
        };

        // Update the cached messages with the real-time message from WebSocket
        queryClient.setQueryData<ChatMessage[]>(
            ['messages', selectedConversation.conversationId],
            (prev) => {
                if (!prev) return [chatMessage];
                if (prev.some((m) => m.messageId === chatMessage.messageId)) return prev;
                return [...prev, chatMessage];
            }
        );
    }, [lastMessage, selectedConversation, queryClient]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        const tempText = messageInput;
        setMessageInput('');
        try {
            await sendMessageMutation.mutateAsync(tempText);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await messageService.deleteMessage(messageId);
            // Remove from cache
            if (selectedConversation) {
                queryClient.setQueryData<ChatMessage[]>(
                    ['messages', selectedConversation.conversationId],
                    (prev) => prev?.filter((m) => m.messageId !== messageId) ?? []
                );
            }
        } catch (error) {
            console.error('Failed to delete message', error);
        }
    };

    const handleCreateSupport = async () => {
        if (isCreatingSupport) return;
        setIsCreatingSupport(true);
        try {
            const newConv = await messageService.createConversation(SUPPORT_PLACEHOLDER_USER_ID, true);
            setConversations((prev) => {
                const filtered = prev.filter((c) => c.conversationId !== newConv.conversationId);
                return [newConv, ...filtered];
            });
            setSelectedConversation(newConv);
            setStoredSupportConversationId(currentUserId, newConv.conversationId);
            emitSupportChatSync();
        } catch (error) {
            console.error('Failed to create support chat', error);
            alert('Failed to connect to support');
        } finally {
            setIsCreatingSupport(false);
        }
    };

    const handleEditMessage = async (messageId: string, currentContent: string) => {
        const next = window.prompt('Edit message', currentContent);
        if (next == null || next.trim() === '' || next === currentContent) return;
        try {
            await messageService.editMessage(messageId, next);
            // Update cache
            if (selectedConversation) {
                queryClient.setQueryData<ChatMessage[]>(
                    ['messages', selectedConversation.conversationId],
                    (prev) => prev?.map((m) => (m.messageId === messageId ? { ...m, content: next } : m)) ?? []
                );
            }
        } catch (error) {
            console.error('Failed to edit message', error);
        }
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        try {
            await messageService.addReaction(messageId, emoji);
        } catch (error) {
            console.error('Failed to add reaction', error);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFilesSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        if (!selectedConversation) return;
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;
        try {
            await messageService.uploadImages(selectedConversation.conversationId, files);
        } catch (error) {
            console.error('Failed to upload images', error);
        } finally {
            event.target.value = '';
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="min-h-[70vh] flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="h-[calc(100vh-64px)] w-full py-2 flex flex-col px-4">
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex min-h-0">
                                    {/* contacts sidebar */}

                    {/* 1. Contacts Sidebar */}
                    <div className="w-[380px] border-r border-slate-50 flex flex-col bg-white">
                        <div className="p-8 pb-6">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-[32px] font-[900] text-slate-900 tracking-tight">Messages</h1>
                                <button
                                    type="button"
                                    disabled={isCreatingSupport}
                                    onClick={handleCreateSupport}
                                    className="group relative p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {isCreatingSupport ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Headphones className="w-5 h-5" />
                                    )}
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                                        Support Team
                                    </span>
                                </button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-all duration-300 group-focus-within:text-blue-500 group-focus-within:scale-110" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-14 pr-5 py-4 bg-slate-50/50 rounded-[1.25rem] outline-none border border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all duration-300 text-sm font-semibold placeholder:text-slate-300 text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 custom-scrollbar">
                            {conversations.map((chat) => {
                                const isSelected = selectedConversation?.conversationId === chat.conversationId;
                                const displayName = chat.otherUser?.fullName ?? chat.conversationName ?? 'Guest User';
                                const avatar = chat.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
                                const timestamp = chat.lastActivity
                                    ? new Date(chat.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : '';
                                
                                return (
                                <div
                                    key={chat.conversationId}
                                    onClick={() => setSelectedConversation(chat)}
                                    className={`group p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 flex gap-4 items-center border ${isSelected
                                        ? 'bg-blue-50/60 border-blue-100/50 shadow-sm'
                                        : 'hover:bg-slate-50/80 border-transparent'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img 
                                            src={avatar} 
                                            className={`w-14 h-14 rounded-[1.1rem] object-cover shadow-sm transition-transform duration-500 group-hover:scale-105 ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`} 
                                            alt="" 
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`text-[15px] font-bold truncate transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                                {displayName}
                                            </h3>
                                            <span className={`text-[10px] font-bold tracking-tight shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                                                {timestamp}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[13px] truncate font-medium flex-1 ${isSelected ? 'text-blue-600/70' : chat.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                                                {chat.lastMessage || 'Start a conversation'}
                                            </p>
                                            {chat.unreadCount > 0 && !isSelected && (
                                                <div className="bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-blue-200 shrink-0 animate-bounce-subtle">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Main Chat Window */}
                    <div className="flex-1 flex flex-col bg-slate-50/50">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-3.5 bg-white border-b border-slate-50 flex justify-between items-center shadow-sm relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="relative group cursor-pointer" onClick={() => setSidebarOpen(true)}>
                                            <img
                                                src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                                className="w-11 h-11 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-105"
                                                alt=""
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 border-[3.5px] border-white rounded-full shadow-sm animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h2 className="font-[900] text-slate-900 text-[17px] leading-none mb-1.5 tracking-tight">
                                                {selectedConversation.otherUser?.fullName ?? selectedConversation.conversationName ?? 'Guest User'}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="text-[10px] text-green-600 font-[800] uppercase tracking-[0.1em]">Active now</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 relative overflow-hidden flex flex-col">
                                    {/* Subtle background pattern layer - Moved outside scroll area */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0"></div>
                                    
                                    {/* Chat Messages */}
                                    <div
                                        ref={messagesScrollRef}
                                        className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10"
                                    >
                                        <div className="flex flex-col gap-6">
                                            {messages.map((msg) => {
                                        if (msg.messageType === 'SYSTEM') {
                                            return (
                                                <div key={msg.messageId} className="flex justify-center my-4">
                                                    <span className="bg-slate-100/60 backdrop-blur-sm text-slate-500 text-[10px] px-5 py-2 rounded-full font-bold uppercase tracking-widest shadow-sm">
                                                        {msg.content}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        const isMe =
                                            !!msg.sender?.userId && !!currentUserId
                                                ? msg.sender.userId === currentUserId
                                                : false;
                                        
                                        const timestamp = msg.sentAt
                                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '';
                                        
                                        return (
                                        <div
                                            key={msg.messageId}
                                            className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex max-w-[85%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Consistent spacing spacer for alignment */}
                                                {isMe && <div className="w-9 shrink-0" />}
                                                {!isMe && (
                                                    <img 
                                                        src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                                        className="w-9 h-9 rounded-xl object-cover shadow-sm self-end mb-1"
                                                        alt=""
                                                    />
                                                )}
                                                
                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`relative group px-6 py-4 rounded-[1.8rem] shadow-sm transition-all duration-300 ${isMe
                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none shadow-blue-100'
                                                        : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-slate-100/50'
                                                        }`}
                                                    >
                                                        {msg.messageType === 'IMAGE' ? (
                                                            <div className="space-y-3">
                                                                <div className="relative group/img overflow-hidden rounded-2xl shadow-inner bg-slate-100 min-w-[200px]">
                                                                    <img 
                                                                        src={msg.mediaUrl || ''} 
                                                                        className="max-w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105" 
                                                                        alt="Media" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                                                        <button className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all shadow-xl">
                                                                            <Download className="w-5 h-5 text-slate-900" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {msg.content && <p className="text-[13px] font-medium leading-relaxed">{msg.content}</p>}
                                                            </div>
                                                        ) : msg.messageType === 'AUDIO' ? (
                                                            <div className={`flex items-center gap-4 min-w-[240px] p-1 ${isMe ? 'text-white' : 'text-slate-700'}`}>
                                                                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                                                    <div className={`w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] ${isMe ? 'border-l-white' : 'border-l-slate-700'} border-b-[6px] border-b-transparent ml-1`}></div>
                                                                </button>
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-end gap-0.5 h-6">
                                                                        {[40, 70, 45, 90, 60, 30, 80, 50, 40, 70, 45, 90].map((h, i) => (
                                                                            <div key={i} className={`flex-1 rounded-full ${isMe ? 'bg-white/40' : 'bg-slate-200'}`} style={{ height: `${h}%` }}></div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[10px] font-bold opacity-70">
                                                                        <span>0:00</span>
                                                                        <span>0:12</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[14px] font-semibold leading-relaxed break-words">
                                                                {msg.content}
                                                            </p>
                                                        )}

                                                        {/* Action Hover Menu */}
                                                        {isMe && (
                                                            <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 pr-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditMessage(msg.messageId, msg.content)}
                                                                    className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                                                                >
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteMessage(msg.messageId)}
                                                                    className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`flex items-center gap-2 mt-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-tighter">
                                                            {timestamp}
                                                        </span>
                                                        {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                                        {!isMe && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddReaction(msg.messageId, '❤️')}
                                                                className="text-[10px] hover:scale-125 transition-transform"
                                                            >
                                                                ❤️
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Chat Input area */}
                                <div className="p-4 bg-white border-t border-slate-50">
                                    <div className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-[2rem] border border-slate-100 focus-within:border-blue-100 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-50/50 transition-all duration-500">
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-blue-500"
                                        >
                                            <Paperclip className="w-6 h-6" />
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Write your message here..."
                                            className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-slate-700 placeholder:text-slate-300"
                                        />
                                        <button className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-amber-500">
                                            <Smile className="w-6 h-6" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim()}
                                            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-[1.2rem] shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-90 disabled:grayscale disabled:opacity-50"
                                        >
                                            <Send className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-white/50 backdrop-blur-sm">
                                <div className="w-36 h-36 bg-blue-50 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner border border-blue-50">
                                    <Send className="w-14 h-14 text-blue-200 animate-pulse" />
                                </div>
                                <h3 className="text-[32px] font-[900] text-slate-900 mb-4 tracking-tight">Your Inbox</h3>
                                <p className="text-slate-400 max-w-sm font-bold leading-relaxed">Select a conversation from the left to start chatting with hosts or our support team.</p>
                            </div>
                        )}
                    </div>

                    {/* 3. User Info Sidebar */}
                    <div className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out border-l border-slate-50 ${sidebarOpen ? 'w-96 overflow-y-auto custom-scrollbar' : 'w-0'}`}>
                        {selectedConversation ? (
                            <div className="p-10 w-96">
                                {/* Back Button */}
                                <button 
                                    onClick={() => setSidebarOpen(false)}
                                    className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                    <span className="text-sm font-semibold">Back</span>
                                </button>
                                
                                {/* User Profile Section */}
                                <div className="text-center mb-10">
                                    <img 
                                        src={selectedConversation.otherUser?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.fullName}`}
                                        className="w-28 h-28 rounded-3xl mx-auto mb-5 border-4 border-slate-50 shadow-md object-cover"
                                        alt=""
                                    />
                                    <h3 className="text-xl font-black text-slate-900 mb-1">{selectedConversation.otherUser?.fullName}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedConversation.otherUser?.email}</p>
                                </div>
                                
                                <div className="space-y-7">
                                    {/* Settings Section */}
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Information</h4>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[10px] font-bold">✓</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Verified User</p>
                                                    <p className="text-[10px] font-medium text-slate-400">Account verified</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Member Since</p>
                                                    <p className="text-[10px] font-medium text-slate-400">Active member</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-10 w-96">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-relaxed">Select a user to view their profile</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

// Premium UI Utilities
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
}
