/**
 * Khi gửi tin từ ChatWidget hoặc /messages, bên còn lại refetch để đồng bộ danh sách + thread.
 */
export const SUPPORT_CHAT_SYNC_EVENT = 'eduspace-support-chat-sync';

export function emitSupportChatSync(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SUPPORT_CHAT_SYNC_EVENT));
}
