import { Conversation, CONVERSATIONS, Message } from '../data/mockData';

class MessageService {
    async getConversations(): Promise<Conversation[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(CONVERSATIONS), 500);
        });
    }

    async sendMessage(conversationId: number, text: string): Promise<Message> {
        return new Promise((resolve) => {
            const newMessage: Message = {
                id: Date.now(),
                senderId: 101, // Mock user ID
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };
            setTimeout(() => resolve(newMessage), 300);
        });
    }
}

export const messageService = new MessageService();
