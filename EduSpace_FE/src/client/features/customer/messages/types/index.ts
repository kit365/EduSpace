export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'AUDIO';

export interface PublicUserProfile {
    userId: string; // keycloakId
    fullName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
}

export interface SearchUserResult {
    keycloakId: string;
    fullName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
}

export interface Conversation {
    conversationId: string;
    conversationName?: string | null;
    isActive: boolean;
    isAdminConversation: boolean;
    videoCallEnabled: boolean;
    totalMessageCount: number;
    callHistoryCount: number;
    lastActivity?: string | null;
    createdAt?: string | null;
    isBlocked: boolean;
    isBlockedByMe: boolean;
    unreadCount: number;
    lastMessage?: string | null;
    otherUser?: PublicUserProfile | null;
    pendingAssignmentOffer?: PendingAssignmentOffer | null;
}

export interface PendingAssignmentOffer {
    offerId: string;
    targetAdminId: string;
    expiresAt: string;
}

export interface ChatMessage {
    messageId: string;
    conversationId: string;
    content: string;
    messageType: MessageType;
    sentAt: string;
    isRead: boolean;
    readAt?: string | null;
    isDeleted: boolean;
    editedAt?: string | null;
    mediaUrl?: string | null;
    mediaType?: string | null;
    reactions?: Record<string, string[]> | null;
    replyToMessageId?: string | null;
    sender?: PublicUserProfile | null;
}

export interface ConversationActivityEvent {
    type: 'CONVERSATION_ACTIVITY';
    conversationId: string;
    lastMessage: string;
    lastActivity: string;
    senderId: string;
    messageType: MessageType;
}

export interface AssignmentOfferEvent {
    type: 'ASSIGNMENT_OFFER';
    conversationId: string;
    offerId: string;
    expiresAt: string;
    targetAdminId: string;
    lastMessage: string;
    lastActivity: string;
    senderId: string;
    messageType: MessageType;
}

export type ConversationInboxEvent = ConversationActivityEvent | AssignmentOfferEvent;

export interface WebSocketMessagePayload {
    messageId: string;
    senderId: string;
    senderUsername?: string | null;
    senderEmail?: string | null;
    content: string;
    messageType: MessageType;
    sentAt: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    conversationId: string;
}

export interface WebSocketReadReceiptPayload {
    conversationId: string;
    readerId: string;
    readAt: string;
}

export interface WebSocketEditedPayload {
    messageId: string;
    newContent: string;
    editedAt?: string | null;
}

export interface WebSocketDeletedPayload {
    messageId: string;
    deletedAt?: string | null;
}

export interface WebSocketReactionPayload {
    messageId: string;
    emoji: string;
    reactorId: string;
}
