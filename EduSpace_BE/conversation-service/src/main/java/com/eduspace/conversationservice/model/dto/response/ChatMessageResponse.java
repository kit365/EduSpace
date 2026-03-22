package com.eduspace.conversationservice.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    @JsonProperty("isRead")
    Boolean isRead;
    LocalDateTime readAt;
    @JsonProperty("isDeleted")
    Boolean isDeleted;
    LocalDateTime editedAt;
    String mediaUrl;
    String mediaType;
    Map<String, List<String>> reactions;
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

