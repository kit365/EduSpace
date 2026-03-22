import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { messageService } from '../../client/features/customer/messages/services/messageService';
import { useTranslation } from 'react-i18next';

export function FloatingChatButton() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            // Create or get the admin conversation
            // Passing null as otherUserId because backend resolveAdminTarget will use supportAdminKeycloakId
            const conversation = await messageService.createConversation('', true);
            navigate('/messages', { 
                state: { 
                    conversationId: conversation.conversationId,
                    isAdminConversation: true 
                } 
            });
        } catch (error) {
            console.error('Failed to start support chat:', error);
            // Fallback: just go to messages
            navigate('/messages');
        }
    };

    return (
        <div 
            className="fixed bottom-8 right-8 z-[60]"
        >
            {/* Main FAB */}
            <button
                onClick={handleClick}
                className="group relative w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-b-4 border-red-700"
                title={t('customer.support.chatWithStaff')}
            >
                <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            </button>
        </div>
    );
}
