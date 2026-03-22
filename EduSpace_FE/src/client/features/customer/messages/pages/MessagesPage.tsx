import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Send, Search, MoreVertical, Paperclip, Smile, Loader2, Headphones } from 'lucide-react';
import { useConversations } from '../hooks/useMessages';
import { messageService } from '../services/messageService';
import type { ChatMessage, Conversation } from '../types';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { useAuthStore } from '../../../../../stores/authStore';

function decodeUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
        const [, payload] = token.split('.');
        if (!payload) return null;
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return json.sub ?? null;
    } catch {
        return null;
    }
}

export function MessagesPage() {
    const { conversations, loading, setConversations } = useConversations();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const accessToken = useAuthStore((state) => state.accessToken);
    const currentUserId = useMemo(() => decodeUserIdFromToken(accessToken), [accessToken]);

    const { lastMessage } = useChatWebSocket({
        conversationId: selectedConversation?.conversationId ?? null,
        userId: currentUserId,
    });

    useEffect(() => {
        if (!selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0]);
        }
    }, [conversations, selectedConversation]);

    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedConversation) {
                setMessages([]);
                return;
            }
            try {
                const history = await messageService.getMessages(selectedConversation.conversationId, 0, 50);
                setMessages(history.slice().reverse());
                await messageService.markRead(selectedConversation.conversationId);
            } catch (error) {
                console.error('Failed to load messages', error);
            }
        };
        loadMessages();
    }, [selectedConversation]);

    useEffect(() => {
        if (!lastMessage || !selectedConversation) return;
        if (lastMessage.conversationId !== selectedConversation.conversationId) return;

        setMessages((prev) => [
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
                sender: lastMessage.senderId
                    ? {
                        userId: lastMessage.senderId,
                        fullName: lastMessage.senderUsername ?? null,
                        email: lastMessage.senderEmail ?? null,
                        avatarUrl: null,
                    }
                    : null,
            },
        ]);
    }, [lastMessage, selectedConversation]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const tempText = messageInput;
            setMessageInput('');
            await messageService.sendText(selectedConversation.conversationId, tempText);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await messageService.deleteMessage(messageId);
            setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
        } catch (error) {
            console.error('Failed to delete message', error);
        }
    };

    const handleCreateSupport = async () => {
        try {
            // Initiate the Saga to assign a real staff member
            // The UUID here is a placeholder required by the path variable/DTO, 
            // the backend will override it with a real staff Keycloak ID
            const newConv = await messageService.createConversation('admin-keycloak-id-0000', true);
            setConversations((prev) => {
                const filtered = prev.filter(c => c.conversationId !== newConv.conversationId);
                return [newConv, ...filtered];
            });
            setSelectedConversation(newConv);
        } catch (error) {
            console.error('Failed to create support chat', error);
            alert('Failed to connect to support');
        }
    };

    const handleEditMessage = async (messageId: string, currentContent: string) => {
        const next = window.prompt('Edit message', currentContent);
        if (next == null || next.trim() === '' || next === currentContent) return;
        try {
            await messageService.editMessage(messageId, next);
            setMessages((prev) =>
                prev.map((m) => (m.messageId === messageId ? { ...m, content: next } : m)),
            );
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
            <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-slate-200/50 overflow-hidden h-[780px] flex">

                    {/* Contacts Sidebar */}
                    <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
                        <div className="p-8 border-b border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
                                <button
                                    onClick={handleCreateSupport}
                                    title="Contact Support"
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <Headphones className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-red-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all text-sm font-bold placeholder:text-gray-300 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                            {conversations.map((chat) => {
                                const isSelected = selectedConversation?.conversationId === chat.conversationId;
                                const displayName = chat.otherUser?.fullName ?? 'Unknown user';
                                const avatar = chat.otherUser?.avatarUrl ?? 'https://i.pravatar.cc/150?img=56';
                                const timestamp = chat.lastActivity
                                    ? new Date(chat.lastActivity).toLocaleTimeString()
                                    : '';
                                return (
                                <div
                                    key={chat.conversationId}
                                    onClick={() => setSelectedConversation(chat)}
                                    className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 flex gap-4 items-center ${isSelected
                                        ? 'bg-red-500 text-white shadow-xl shadow-red-200 translate-x-2'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={avatar} className={`w-14 h-14 rounded-full object-cover shadow-md border-2 ${isSelected ? 'border-white' : 'border-transparent'}`} alt="" />
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-black truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{displayName}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-red-100' : 'text-gray-400'}`}>{timestamp}</span>
                                        </div>
                                        <p className={`text-sm truncate font-bold ${isSelected ? 'text-red-50' : chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && !isSelected && (
                                        <div className="bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1 flex flex-col bg-slate-50/50">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 bg-white border-b border-gray-50 flex justify-between items-center shadow-sm relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={selectedConversation.otherUser?.avatarUrl ?? 'https://i.pravatar.cc/150?img=56'}
                                                className="w-12 h-12 rounded-full object-cover shadow-sm"
                                                alt=""
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h2 className="font-black text-gray-900 text-lg leading-none mb-1">
                                                {selectedConversation.otherUser?.fullName ?? 'Unknown user'}
                                            </h2>
                                            <p className="text-xs text-green-500 font-black uppercase tracking-widest">Active now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                                            <MoreVertical className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-70">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender?.userId && currentUserId
                                            ? msg.sender.userId === currentUserId
                                            : false;
                                        const text =
                                            msg.messageType === 'IMAGE'
                                                ? '[Image]'
                                                : msg.content;
                                        const timestamp = msg.sentAt
                                            ? new Date(msg.sentAt).toLocaleTimeString()
                                            : '';
                                        return (
                                        <div
                                            key={msg.messageId}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-5 rounded-[28px] shadow-sm text-sm font-bold leading-relaxed ${isMe
                                                ? 'bg-gray-900 text-white rounded-br-none shadow-gray-200'
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-slate-100'
                                                }`}
                                            >
                                                {text}
                                                <div
                                                    className={`text-[10px] mt-2 font-black uppercase tracking-widest opacity-40 ${
                                                        isMe ? 'text-white text-right' : 'text-gray-400 text-left'
                                                    }`}
                                                >
                                                    {timestamp}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold opacity-70">
                                                    {isMe && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditMessage(msg.messageId, msg.content)}
                                                                className="underline hover:opacity-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMessage(msg.messageId)}
                                                                className="underline hover:opacity-100"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddReaction(msg.messageId, '❤️')}
                                                        className="ml-auto hover:opacity-100"
                                                        aria-label="Add heart reaction"
                                                    >
                                                        ❤️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>

                                {/* Chat Input */}
                                <div className="p-8 bg-white border-t border-gray-50">
                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[32px] border border-gray-100 focus-within:border-red-200 focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-red-100 transition-all duration-500">
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-red-500"
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
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Write your message here..."
                                            className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300"
                                        />
                                        <button className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-amber-500">
                                            <Smile className="w-6 h-6" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim()}
                                            className="bg-red-500 text-white p-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-90 disabled:grayscale disabled:opacity-50"
                                        >
                                            <Send className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center mb-8 shadow-inner border border-gray-100">
                                    <Send className="w-12 h-12 text-gray-200" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Your Inbox</h3>
                                <p className="text-gray-400 max-w-sm font-bold">Select a conversation to start chatting with hosts or support team.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
