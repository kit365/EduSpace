import type {
    ChatMessage,
    Conversation,
    ConversationActivityEvent,
    WebSocketDeletedPayload,
    WebSocketEditedPayload,
    WebSocketMessagePayload,
    WebSocketReactionPayload,
    WebSocketReadReceiptPayload,
} from '../types';

export function parseMediaUrls(mediaUrl?: string | null): string[] {
    if (!mediaUrl) return [];
    try {
        if (mediaUrl.startsWith('[')) {
            const parsed = JSON.parse(mediaUrl);
            if (Array.isArray(parsed)) {
                return parsed.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
            }
        }
    } catch {
        // Fallback to single url below.
    }
    return [mediaUrl];
}

export function buildChatMessageFromWs(payload: WebSocketMessagePayload): ChatMessage {
    return {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        content: payload.content,
        messageType: payload.messageType ?? 'TEXT',
        sentAt: payload.sentAt,
        isRead: false,
        isDeleted: false,
        mediaUrl: payload.mediaUrl ?? null,
        mediaType: null,
        readAt: null,
        editedAt: null,
        reactions: null,
        replyToMessageId: null,
        sender: payload.senderId
            ? {
                  userId: payload.senderId,
                  fullName: payload.senderUsername ?? null,
                  email: payload.senderEmail ?? null,
                  avatarUrl: null,
              }
            : null,
    };
}

export function appendUniqueMessage(messages: ChatMessage[], nextMessage: ChatMessage): ChatMessage[] {
    if (messages.some((m) => m.messageId === nextMessage.messageId)) return messages;
    return [...messages, nextMessage];
}

export function applyEditEvent(messages: ChatMessage[], event: WebSocketEditedPayload): ChatMessage[] {
    return messages.map((m) =>
        m.messageId === event.messageId
            ? { ...m, content: event.newContent, editedAt: event.editedAt ?? new Date().toISOString() }
            : m,
    );
}

export function applyDeleteEvent(messages: ChatMessage[], event: WebSocketDeletedPayload): ChatMessage[] {
    return messages.map((m) =>
        m.messageId === event.messageId
            ? { ...m, isDeleted: true, content: 'Message deleted' }
            : m,
    );
}

export function applyReactionEvent(messages: ChatMessage[], event: WebSocketReactionPayload): ChatMessage[] {
    return messages.map((m) => {
        if (m.messageId !== event.messageId) return m;
        const next = { ...(m.reactions ?? {}) };
        const users = new Set(next[event.emoji] ?? []);
        users.add(event.reactorId);
        next[event.emoji] = Array.from(users);
        return { ...m, reactions: next };
    });
}

export function applyReadReceiptEvent(
    messages: ChatMessage[],
    event: WebSocketReadReceiptPayload,
    currentUserId?: string | null,
): ChatMessage[] {
    if (!currentUserId) return messages;
    return messages.map((m) => {
        if (m.sender?.userId !== currentUserId) return m;
        return { ...m, isRead: true, readAt: event.readAt };
    });
}

export function getConversationPreview(message: Pick<ChatMessage, 'messageType' | 'content' | 'mediaUrl'>): string {
    if (message.messageType === 'IMAGE') {
        const imageCount = parseMediaUrls(message.mediaUrl).length;
        return imageCount > 1 ? `📷 ${imageCount} images` : '📷 Image';
    }
    if (message.messageType === 'SYSTEM') {
        return 'Call activity';
    }
    const trimmed = (message.content ?? '').trim();
    if (!trimmed) return '';
    return trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed;
}

export function applyConversationActivity(
    conversations: Conversation[],
    event: ConversationActivityEvent,
    context: {
        activeConversationId?: string | null;
        currentUserId?: string | null;
    },
): Conversation[] {
    const { activeConversationId, currentUserId } = context;
    const isActive = activeConversationId === event.conversationId;
    const isFromMe = !!currentUserId && event.senderId === currentUserId;
    const preview =
        event.messageType === 'IMAGE'
            ? '[Image]'
            : event.messageType === 'SYSTEM'
              ? 'Call activity'
              : event.lastMessage;

    const idx = conversations.findIndex((c) => c.conversationId === event.conversationId);
    if (idx < 0) return conversations;

    const next = [...conversations];
    const current = next[idx];
    next[idx] = {
        ...current,
        lastActivity: event.lastActivity,
        lastMessage: preview,
        unreadCount: isActive || isFromMe ? 0 : (current.unreadCount || 0) + 1,
    };
    const [updated] = next.splice(idx, 1);
    next.unshift(updated);
    return next;
}
