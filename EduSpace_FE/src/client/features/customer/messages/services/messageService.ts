import apiClient from '../../../../../lib/axios';
import { API_PREFIX } from '../../../../../config/api/base';
import { ACCOUNT_API } from '../../../../../config/api/account';
import type { ChatMessage, Conversation, SearchUserResult } from '../types';
import type { ApiResponse } from '../../../../../types/api';
import { getOrCreateGuestId } from '../../../../../utils/guest';
import { useAuthStore } from '../../../../../stores/authStore';

function devChatLog(label: string, payload?: unknown) {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info(`[messageService] ${label}`, payload ?? '');
    }
}

export class MessageService {
    private readonly BASE_PATH = `${API_PREFIX}/conversations`;
    private readonly MESSAGE_PATH = `${API_PREFIX}/messages`;

    private getHeaders() {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
            const gid = getOrCreateGuestId();
            return { 'X-Guest-ID': gid, 'x-guest-id': gid };
        }
        // Logged in: identity is JWT sub only — never send X-Guest-ID (avoids stale GUEST-* in localStorage).
        return {};
    }

    async getConversationById(conversationId: string): Promise<Conversation> {
        devChatLog(`GET /conversations/${conversationId}`);
        const res = await apiClient.get<any, ApiResponse<Conversation>>(`${this.BASE_PATH}/${conversationId}`, {
            headers: this.getHeaders(),
        });
        const conv = res.data;
        if (!conv?.conversationId) {
            throw new Error('Conversation not found');
        }
        return conv;
    }

    async getConversations(): Promise<Conversation[]> {
        const hasBearer = !!useAuthStore.getState().accessToken;
        devChatLog('GET /conversations', { hasBearer });
        const res = await apiClient.get<any, ApiResponse<Conversation[]>>(this.BASE_PATH, {
            headers: this.getHeaders()
        });
        const data = res.data ?? [];
        devChatLog('GET /conversations response', {
            count: data.length,
            adminConvs: data.filter((c) => c.isAdminConversation).map((c) => c.conversationId),
        });
        return data;
    }

    async getAdminConversations(): Promise<Conversation[]> {
        devChatLog('GET /conversations/admin');
        const res = await apiClient.get<any, ApiResponse<Conversation[]>>(`${this.BASE_PATH}/admin`, {
            headers: this.getHeaders()
        });
        const data = res.data ?? [];
        devChatLog('GET /conversations/admin response', { count: data.length, conversationIds: data.map((c) => c.conversationId) });
        return data;
    }

    async createConversation(otherUserId: string, isAdminConversation = false): Promise<Conversation> {
        devChatLog('POST /conversations', { otherUserId, isAdminConversation });
        const res = await apiClient.post<any, ApiResponse<Conversation>>(
            this.BASE_PATH,
            { otherUserId, isAdminConversation },
            { headers: this.getHeaders() }
        );
        devChatLog('POST /conversations response', { conversationId: res.data?.conversationId });
        return res.data;
    }

    async acceptAssignmentOffer(conversationId: string, offerId: string): Promise<Conversation> {
        const res = await apiClient.post<any, ApiResponse<Conversation>>(
            `${this.BASE_PATH}/${conversationId}/assignment-offers/${offerId}/accept`,
            {},
            { headers: this.getHeaders() },
        );
        return res.data;
    }

    async getMessages(conversationId: string, page = 0, size = 50): Promise<ChatMessage[]> {
        devChatLog(`GET /conversations/${conversationId}/messages`, { page, size });
        const res = await apiClient.get<any, ApiResponse<ChatMessage[]>>(
            `${this.BASE_PATH}/${conversationId}/messages`,
            { 
                params: { page, size },
                headers: this.getHeaders()
            },
        );
        const data = res.data ?? [];
        devChatLog(`GET .../messages response`, { conversationId, messageCount: data.length });
        return data;
    }

    async sendText(conversationId: string, content: string): Promise<ChatMessage> {
        devChatLog(`POST .../messages (TEXT)`, { conversationId, len: content.length });
        const res = await apiClient.post<any, ApiResponse<ChatMessage>>(
            `${this.BASE_PATH}/${conversationId}/messages`,
            { content, messageType: 'TEXT' },
            { headers: this.getHeaders() }
        );
        devChatLog('sendText response', { messageId: res.data?.messageId });
        return res.data;
    }

    async markRead(conversationId: string): Promise<void> {
        await apiClient.post(`${this.BASE_PATH}/${conversationId}/read`, {}, { headers: this.getHeaders() });
    }

    async uploadImages(conversationId: string, files: File[]): Promise<ChatMessage> {
        const formData = new FormData();
        const headers = { ...this.getHeaders() };

        if (files.length === 1) {
            formData.append('image', files[0]);
            const res = await apiClient.post<any, ApiResponse<ChatMessage>>(
                `${this.BASE_PATH}/${conversationId}/messages/image`,
                formData,
                { headers },
            );
            return res.data;
        }

        files.forEach((f) => formData.append('images', f));
        const res = await apiClient.post<any, ApiResponse<ChatMessage>>(
            `${this.BASE_PATH}/${conversationId}/messages/images`,
            formData,
            { headers },
        );
        return res.data;
    }

    async deleteMessage(messageId: string): Promise<void> {
        await apiClient.delete(`${this.MESSAGE_PATH}/${messageId}`, { headers: this.getHeaders() });
    }

    async editMessage(messageId: string, content: string): Promise<void> {
        await apiClient.put(`${this.MESSAGE_PATH}/${messageId}`, { content }, { headers: this.getHeaders() });
    }

    async addReaction(messageId: string, emoji: string): Promise<void> {
        await apiClient.post(`${this.MESSAGE_PATH}/${messageId}/reactions`, { emoji }, { headers: this.getHeaders() });
    }

    async searchUsers(query: string, limit = 20): Promise<SearchUserResult[]> {
        const res = await apiClient.get<any, ApiResponse<SearchUserResult[]>>(`${API_PREFIX}/accounts/public/search`, {
            params: { query, limit },
        });
        return res.data ?? [];
    }

    /** Active ADMIN + SUPER_ADMIN in DB (eligible for assignStaff), not real-time "online". */
    async getEligibleSupportStaffCount(): Promise<number> {
        const res = await apiClient.get<any, ApiResponse<number>>(
            `${API_PREFIX}/accounts/public/support/eligible-staff-count`,
        );
        return typeof res.data === 'number' ? res.data : 0;
    }

    /** Admins with portal open (heartbeat within server window). */
    async getOnlineSupportStaffCount(): Promise<number> {
        const res = await apiClient.get<any, ApiResponse<number>>(ACCOUNT_API.PUBLIC_SUPPORT_ONLINE_STAFF_COUNT);
        return typeof res.data === 'number' ? res.data : 0;
    }

    /**
     * After login: move support threads from browser guest id to Keycloak user.
     * Requires Bearer (interceptor). Pass the guest id captured **before** setTokens (or omit to skip).
     */
    async claimGuestSupportConversations(guestIdFromPreLogin?: string | null): Promise<number> {
        const guestId =
            guestIdFromPreLogin?.startsWith('GUEST-') ? guestIdFromPreLogin : null;
        if (!guestId) return 0;
        const res = await apiClient.post<any, ApiResponse<number>>(
            `${this.BASE_PATH}/claim-guest`,
            {},
            {
                headers: {
                    'X-Guest-ID': guestId,
                    'x-guest-id': guestId,
                },
            },
        );
        return typeof res.data === 'number' ? res.data : 0;
    }
}

export const messageService = new MessageService();
