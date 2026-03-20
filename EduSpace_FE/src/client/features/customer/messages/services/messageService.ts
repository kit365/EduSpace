import apiClient from '../../../../../lib/axios';
import { API_PREFIX } from '../../../../../config/api/base';
import type { ChatMessage, Conversation } from '../types';
import type { ApiResponse } from '../../../../../types/api';

export class MessageService {
    async getConversations(): Promise<Conversation[]> {
        const res = await apiClient.get<any, ApiResponse<{ conversations: Conversation[] }>>(
            `${API_PREFIX}/conversations`,
        );
        return res.data?.conversations ?? [];
    }

    async createConversation(otherUserId: string, isAdminConversation = false): Promise<Conversation> {
        const res = await apiClient.post<any, ApiResponse<{ conversation: Conversation }>>(
            `${API_PREFIX}/conversations`,
            { otherUserId, isAdminConversation },
        );
        return res.data.conversation;
    }

    async getMessages(conversationId: string, page = 0, size = 50): Promise<ChatMessage[]> {
        const res = await apiClient.get<any, ApiResponse<{ messages: ChatMessage[] }>>(
            `${API_PREFIX}/conversations/${conversationId}/messages`,
            { params: { page, size } },
        );
        return res.data?.messages ?? [];
    }

    async sendText(conversationId: string, content: string): Promise<ChatMessage> {
        const res = await apiClient.post<any, ApiResponse<{ message: ChatMessage }>>(
            `${API_PREFIX}/conversations/${conversationId}/messages`,
            { content, messageType: 'TEXT' },
        );
        return res.data.message;
    }

    async markRead(conversationId: string): Promise<void> {
        await apiClient.post(`${API_PREFIX}/conversations/${conversationId}/read`);
    }

    async uploadImages(conversationId: string, files: File[]): Promise<ChatMessage> {
        const formData = new FormData();
        if (files.length === 1) {
            formData.append('image', files[0]);
            const res = await apiClient.post<any, ApiResponse<{ message: ChatMessage }>>(
                `${API_PREFIX}/conversations/${conversationId}/messages/image`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            return res.data.message;
        }

        files.forEach((f) => formData.append('images', f));
        const res = await apiClient.post<any, ApiResponse<{ message: ChatMessage }>>(
            `${API_PREFIX}/conversations/${conversationId}/messages/images`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return res.data.message;
    }

    async deleteMessage(messageId: string): Promise<void> {
        await apiClient.delete(`${API_PREFIX}/messages/${messageId}`);
    }

    async editMessage(messageId: string, content: string): Promise<void> {
        await apiClient.put(`${API_PREFIX}/messages/${messageId}`, { content });
    }

    async addReaction(messageId: string, emoji: string): Promise<void> {
        await apiClient.post(`${API_PREFIX}/messages/${messageId}/reactions`, { emoji });
    }

    async searchUsers(query: string, limit = 20): Promise<
        { keycloakId: string; fullName?: string | null; email?: string | null; avatarUrl?: string | null }[]
    > {
        const res = await apiClient.get<any, ApiResponse<any[]>>(`${API_PREFIX}/accounts/public/search`, {
            params: { query, limit },
        });
        return res.data ?? [];
    }
}

export const messageService = new MessageService();
