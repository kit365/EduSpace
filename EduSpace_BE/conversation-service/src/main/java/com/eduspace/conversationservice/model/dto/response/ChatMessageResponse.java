package com.eduspace.conversationservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String messageId;
    String conversationId;
    String content;
    String messageType;
    LocalDateTime sentAt;
    boolean isRead;
    LocalDateTime readAt;
    boolean isDeleted;
    LocalDateTime editedAt;
    String mediaUrl;
    String mediaType;
    String reactions;
    String replyToMessageId;
    Sender sender;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Sender {
        String userId; // keycloakId
        String fullName;
        String email;
        String avatarUrl;
    }
}

