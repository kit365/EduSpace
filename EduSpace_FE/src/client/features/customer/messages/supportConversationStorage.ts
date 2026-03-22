/**
 * Giữ id thread support theo chat user (Keycloak / GUEST) để sau F5 vẫn load được lịch sử
 * khi GET /conversations chưa trả hoặc thiếu cờ isAdminConversation.
 */
const PREFIX = 'eduspace_support_conversation_id_';

export function getStoredSupportConversationId(chatUserId: string | null | undefined): string | null {
    if (!chatUserId) return null;
    try {
        const v = localStorage.getItem(PREFIX + chatUserId);
        return v && v.length > 0 ? v : null;
    } catch {
        return null;
    }
}

export function setStoredSupportConversationId(
    chatUserId: string | null | undefined,
    conversationId: string | null | undefined,
): void {
    if (!chatUserId) return;
    try {
        if (conversationId && conversationId.length > 0) {
            localStorage.setItem(PREFIX + chatUserId, conversationId);
        } else {
            localStorage.removeItem(PREFIX + chatUserId);
        }
    } catch {
        /* ignore quota / private mode */
    }
}

export function clearStoredSupportConversationId(chatUserId: string | null | undefined): void {
    setStoredSupportConversationId(chatUserId, null);
}
