import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { messageService } from '../../client/features/customer/messages/services/messageService';
import { useTranslation } from 'react-i18next';
import { SUPPORT_PLACEHOLDER_USER_ID } from '../../config/chat';

export function FloatingChatButton() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
    const [isCreating, setIsCreating] = useState(false);

    const handleClick = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        if (isCreating) return;
        setIsCreating(true);
        try {
            const conversation = await messageService.createConversation(SUPPORT_PLACEHOLDER_USER_ID, true);
            navigate('/messages', {
                state: {
                    conversationId: conversation.conversationId,
                    isAdminConversation: true,
                },
            });
        } catch (error) {
            console.error('Failed to start support chat:', error);
            navigate('/messages');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div 
            className="fixed bottom-8 right-8 z-[60]"
        >
            {/* Main FAB */}
            <button
                type="button"
                disabled={isCreating}
                onClick={handleClick}
                className="group relative w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-b-4 border-red-700 disabled:opacity-60 disabled:pointer-events-none"
                title={t('customer.support.chatWithStaff')}
            >
                <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            </button>
        </div>
    );
}
