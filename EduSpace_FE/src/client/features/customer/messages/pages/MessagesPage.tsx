import { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Conversation } from '../data/mockData';
import { Send, Search, MoreVertical, Paperclip, Smile, Loader2 } from 'lucide-react';
import { useConversations } from '../hooks/useMessages';
import { messageService } from '../services/messageService';

export function MessagesPage() {
    const { conversations, loading, setConversations } = useConversations();
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        if (!selectedChat && conversations.length > 0) {
            setSelectedChat(conversations[0]);
        }
    }, [conversations, selectedChat]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChat) return;

        const tempText = messageInput;
        setMessageInput('');

        try {
            const newMessage = await messageService.sendMessage(selectedChat.id, tempText);

            // Update local state for immediate feedback
            const updatedConversations = conversations.map(c => {
                if (c.id === selectedChat.id) {
                    return {
                        ...c,
                        lastMessage: tempText,
                        messages: [...c.messages, newMessage]
                    };
                }
                return c;
            });

            setConversations(updatedConversations);
            setSelectedChat(prev => prev ? {
                ...prev,
                messages: [...prev.messages, newMessage]
            } : null);

        } catch (error) {
            console.error('Failed to send message', error);
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
                            <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Messages</h1>
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
                            {conversations.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 flex gap-4 items-center ${selectedChat?.id === chat.id
                                        ? 'bg-red-500 text-white shadow-xl shadow-red-200 translate-x-2'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={chat.participantAvatar} className={`w-14 h-14 rounded-full object-cover shadow-md border-2 ${selectedChat?.id === chat.id ? 'border-white' : 'border-transparent'}`} alt="" />
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-black truncate ${selectedChat?.id === chat.id ? 'text-white' : 'text-gray-900'}`}>{chat.participantName}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedChat?.id === chat.id ? 'text-red-100' : 'text-gray-400'}`}>{chat.timestamp}</span>
                                        </div>
                                        <p className={`text-sm truncate font-bold ${selectedChat?.id === chat.id ? 'text-red-50' : chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && selectedChat?.id !== chat.id && (
                                        <div className="bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1 flex flex-col bg-slate-50/50">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 bg-white border-b border-gray-50 flex justify-between items-center shadow-sm relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={selectedChat.participantAvatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h2 className="font-black text-gray-900 text-lg leading-none mb-1">{selectedChat.participantName}</h2>
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
                                    {selectedChat.messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`max-w-[70%] p-5 rounded-[28px] shadow-sm text-sm font-bold leading-relaxed ${msg.isMe
                                                ? 'bg-gray-900 text-white rounded-br-none shadow-gray-200'
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-slate-100'
                                                }`}>
                                                {msg.text}
                                                <div className={`text-[10px] mt-2 font-black uppercase tracking-widest opacity-40 ${msg.isMe ? 'text-white text-right' : 'text-gray-400 text-left'}`}>
                                                    {msg.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat Input */}
                                <div className="p-8 bg-white border-t border-gray-50">
                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-[32px] border border-gray-100 focus-within:border-red-200 focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-red-100 transition-all duration-500">
                                        <button className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-red-500">
                                            <Paperclip className="w-6 h-6" />
                                        </button>
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
