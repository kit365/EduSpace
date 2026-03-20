import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import type { Conversation } from '../types';

export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await messageService.getConversations();
                setConversations(data);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { conversations, loading, setConversations };
}
