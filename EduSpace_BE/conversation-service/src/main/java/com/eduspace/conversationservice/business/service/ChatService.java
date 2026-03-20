package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.enums.MessageType;

import java.util.List;

public interface ChatService {
    ConversationResponse getOrCreateConversation(String currentUserId, String otherUserId, boolean isAdminConversation, String bearerToken);

    ConversationResponse getConversationById(String conversationId, String currentUserId, String bearerToken);

    List<ConversationResponse> getUserConversations(String currentUserId, String bearerToken);

    List<ConversationResponse> getAdminConversations(String currentUserId, String bearerToken);

    ChatMessageResponse sendMessage(String conversationId, String senderUserId, String content, MessageType messageType, String bearerToken);

    ChatMessageResponse sendMediaMessage(String conversationId, String senderUserId, String mediaUrl, String mediaType, MessageType messageType, String bearerToken);

    List<ChatMessageResponse> getChatHistory(String conversationId, int page, int size, String bearerToken);

    void markMessagesAsRead(String conversationId, String readerUserId);

    int getUnreadMessageCount(String conversationId, String userId);

    void deleteMessage(String messageId, String deleterUserId);

    void editMessage(String messageId, String newContent, String editorUserId);

    void addReactionToMessage(String messageId, String reactorUserId, String emoji);

    void blockUser(String conversationId, String blockerUserId);

    void unblockUser(String conversationId, String unblockerUserId);
}

