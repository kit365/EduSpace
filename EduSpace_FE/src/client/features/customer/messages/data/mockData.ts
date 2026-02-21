export interface Message {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
    isMe: boolean;
}

export interface Conversation {
    id: number;
    participantName: string;
    participantAvatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    messages: Message[];
}

export const CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        participantName: 'Tech Hub Admin',
        participantAvatar: 'https://i.pravatar.cc/150?img=33',
        lastMessage: 'Your booking for the Training Suite is confirmed!',
        timestamp: '10:30 AM',
        unreadCount: 1,
        messages: [
            { id: 1, senderId: 101, text: 'Hi, I have a question about the projector.', timestamp: 'Yesterday', isMe: true },
            { id: 2, senderId: 1, text: 'Sure, what would you like to know?', timestamp: 'Yesterday', isMe: false },
            { id: 3, senderId: 1, text: 'Your booking for the Training Suite is confirmed!', timestamp: '10:30 AM', isMe: false },
        ]
    },
    {
        id: 2,
        participantName: 'Minh Tran (Host)',
        participantAvatar: 'https://i.pravatar.cc/150?img=11',
        lastMessage: 'Thanks for the details. See you tomorrow!',
        timestamp: 'Yesterday',
        unreadCount: 0,
        messages: [
            { id: 1, senderId: 101, text: 'I will arrive at 9 AM.', timestamp: 'Yesterday', isMe: true },
            { id: 2, senderId: 2, text: 'Thanks for the details. See you tomorrow!', timestamp: 'Yesterday', isMe: false },
        ]
    }
];
