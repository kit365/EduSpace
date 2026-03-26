package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.enums.MessageType;

import java.util.List;

public interface ChatService {
    ConversationResponse getOrCreateConversation(String currentUserId, String otherUserId, boolean isAdminConversation);

    ConversationResponse getConversationById(String conversationId, String currentUserId);

    ConversationResponse acceptAssignmentOffer(String conversationId, String offerId, String adminUserId);

    List<ConversationResponse> getUserConversations(String currentUserId);

    List<ConversationResponse> getAdminConversations(String currentUserId);

    /** Reassign guest-owned support rows to Keycloak user after login. Returns number of conversations updated. */
    int claimGuestSupportConversations(String keycloakUserId, String guestId);

    ChatMessageResponse sendMessage(String conversationId, String senderUserId, String content, MessageType messageType);

    ChatMessageResponse sendMediaMessage(String conversationId, String senderUserId, String mediaUrl, String mediaType, MessageType messageType);

    List<ChatMessageResponse> getChatHistory(String conversationId, int page, int size, String readerUserId);

    void notifyStaffAssignmentFailed(String conversationId, String failureDetail);

    void markMessagesAsRead(String conversationId, String readerUserId);

    int getUnreadMessageCount(String conversationId, String userId);

    void deleteMessage(String messageId, String deleterUserId);

    void editMessage(String messageId, String newContent, String editorUserId);

    void addReactionToMessage(String messageId, String reactorUserId, String emoji);

    void blockUser(String conversationId, String blockerUserId);

    void unblockUser(String conversationId, String unblockerUserId);
}

