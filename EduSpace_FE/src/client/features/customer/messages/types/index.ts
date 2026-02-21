export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: number;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  spaceName?: string;
}
