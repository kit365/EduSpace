import { create } from 'zustand';
import type { AssignmentOfferEvent, ConversationInboxEvent } from '../client/features/customer/messages/types';

export type ChatInboxStoreState = {
    /** Latest inbox event from STOMP (global bridge). Pages read this instead of useChatWebSocket when subscribeInbox is false. */
    lastInboxEvent: ConversationInboxEvent | null;
    /** Sum of unread counts for customer/host (getConversations). */
    totalUnreadCount: number;
    /** Sum of unread for admin inbox (getAdminConversations). */
    adminTotalUnread: number;
    /** Distinct pending assignment offers (admin). */
    pendingAssignmentOffers: Record<string, AssignmentOfferEvent>;
    setLastInboxEvent: (e: ConversationInboxEvent | null) => void;
    setTotalUnreadCount: (n: number) => void;
    setAdminTotalUnread: (n: number) => void;
    setPendingAssignmentOffer: (e: AssignmentOfferEvent) => void;
    clearPendingAssignmentOffer: (conversationId: string) => void;
};

export const useChatInboxStore = create<ChatInboxStoreState>((set) => ({
    lastInboxEvent: null,
    totalUnreadCount: 0,
    adminTotalUnread: 0,
    pendingAssignmentOffers: {},
    setLastInboxEvent: (e) => set({ lastInboxEvent: e }),
    setTotalUnreadCount: (n) => set({ totalUnreadCount: Math.max(0, n) }),
    setAdminTotalUnread: (n) => set({ adminTotalUnread: Math.max(0, n) }),
    setPendingAssignmentOffer: (e) =>
        set((s) => ({
            pendingAssignmentOffers: { ...s.pendingAssignmentOffers, [e.conversationId]: e },
        })),
    clearPendingAssignmentOffer: (conversationId) =>
        set((s) => {
            const next = { ...s.pendingAssignmentOffers };
            delete next[conversationId];
            return { pendingAssignmentOffers: next };
        }),
}));
