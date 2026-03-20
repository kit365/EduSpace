package com.eduspace.conversationservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    String conversationId;
    String conversationName;
    boolean isActive;
    boolean isAdminConversation;
    boolean videoCallEnabled;
    int totalMessageCount;
    int callHistoryCount;
    LocalDateTime lastActivity;
    LocalDateTime createdAt;
    boolean isBlocked;
    boolean isBlockedByMe;
    int unreadCount;
    String lastMessage;
    OtherUser otherUser;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OtherUser {
        String userId; // keycloakId
        String fullName;
        String email;
        String avatarUrl;
    }
}

