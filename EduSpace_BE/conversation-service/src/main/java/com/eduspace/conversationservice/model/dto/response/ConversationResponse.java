package com.eduspace.conversationservice.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isActive")
    Boolean isActive;
    @JsonProperty("isAdminConversation")
    Boolean isAdminConversation;
    @JsonProperty("videoCallEnabled")
    Boolean videoCallEnabled;
    int totalMessageCount;
    int callHistoryCount;
    LocalDateTime lastActivity;
    LocalDateTime createdAt;
    @JsonProperty("isBlocked")
    Boolean isBlocked;
    @JsonProperty("isBlockedByMe")
    Boolean isBlockedByMe;
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

