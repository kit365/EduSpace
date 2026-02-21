import { useState, useEffect } from 'react';
import { Conversation, Message } from '../data/mockData';
import { messageService } from '../services/messageService';

export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await messageService.getConversations();
            setConversations(data);
            setLoading(false);
        };
        fetch();
    }, []);

    return { conversations, loading, setConversations };
}
