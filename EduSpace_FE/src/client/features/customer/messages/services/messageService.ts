import apiClient from '../../../../../lib/axios';
import { API_PREFIX } from '../../../../../config/api/base';
import type { ChatMessage, Conversation, SearchUserResult } from '../types';
import type { ApiResponse } from '../../../../../types/api';
import { getOrCreateGuestId } from '../../../../../utils/guest';
import { useAuthStore } from '../../../../../stores/authStore';

export class MessageService {
    private readonly BASE_PATH = `${API_PREFIX}/conversations`;
    private readonly MESSAGE_PATH = `${API_PREFIX}/messages`;

    private getHeaders() {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
            return { 'X-Guest-ID': getOrCreateGuestId() };
        }
        return {};
    }

    async getConversations(): Promise<Conversation[]> {
        const res = await apiClient.get<any, ApiResponse<Conversation[]>>(this.BASE_PATH, {
            headers: this.getHeaders()
        });
        return res.data ?? [];
    }

    async createConversation(otherUserId: string, isAdminConversation = false): Promise<Conversation> {
        const res = await apiClient.post<any, ApiResponse<Conversation>>(
            this.BASE_PATH,
            { otherUserId, isAdminConversation },
            { headers: this.getHeaders() }
        );
        return res.data;
    }

    async getMessages(conversationId: string, page = 0, size = 50): Promise<ChatMessage[]> {
        const res = await apiClient.get<any, ApiResponse<ChatMessage[]>>(
            `${this.BASE_PATH}/${conversationId}/messages`,
            { 
                params: { page, size },
                headers: this.getHeaders()
            },
        );
        return res.data ?? [];
    }

    async sendText(conversationId: string, content: string): Promise<ChatMessage> {
        const res = await apiClient.post<any, ApiResponse<ChatMessage>>(
            `${this.BASE_PATH}/${conversationId}/messages`,
            { content, messageType: 'TEXT' },
            { headers: this.getHeaders() }
        );
        return res.data;
    }

    async markRead(conversationId: string): Promise<void> {
        await apiClient.post(`${this.BASE_PATH}/${conversationId}/read`, {}, { headers: this.getHeaders() });
    }

    async uploadImages(conversationId: string, files: File[]): Promise<ChatMessage> {
        const formData = new FormData();
        const headers = { ...this.getHeaders(), 'Content-Type': 'multipart/form-data' };
        
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
        await apiClient.delete(`${this.MESSAGE_PATH}/${messageId}`);
    }

    async editMessage(messageId: string, content: string): Promise<void> {
        await apiClient.put(`${this.MESSAGE_PATH}/${messageId}`, { content });
    }

    async addReaction(messageId: string, emoji: string): Promise<void> {
        await apiClient.post(`${this.MESSAGE_PATH}/${messageId}/reactions`, { emoji });
    }

    async searchUsers(query: string, limit = 20): Promise<SearchUserResult[]> {
        const res = await apiClient.get<any, ApiResponse<SearchUserResult[]>>(`${API_PREFIX}/accounts/public/search`, {
            params: { query, limit },
        });
        return res.data ?? [];
    }
}

export const messageService = new MessageService();
