package com.eduspace.conversationservice.infrastructure.mapper;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ChatMessageMapper {

    public ChatMessageResponse toResponse(ChatMessageEntity entity, Map<String, AccountClient.PublicUserProfile> profiles) {
        if (entity == null) {
            return null;
        }
        return ChatMessageResponse.builder()
                .messageId(entity.getId())
                .conversationId(entity.getConversation() != null ? entity.getConversation().getId() : null)
                .content(entity.getContent())
                .messageType(entity.getMessageType() != null ? entity.getMessageType().name() : null)
                .sentAt(entity.getSentAt())
                .isRead(entity.getIsRead())
                .readAt(entity.getReadAt())
                .isDeleted(entity.getIsDeleted())
                .editedAt(entity.getEditedAt())
                .mediaUrl(entity.getMediaUrl())
                .mediaType(entity.getMediaType())
                .reactions(entity.getReactions())
                .replyToMessageId(entity.getReplyToMessageId())
                .sender(mapSender(entity.getSenderId(), profiles))
                .build();
    }

    public ChatMessageResponse.Sender mapSender(String senderId, Map<String, AccountClient.PublicUserProfile> profiles) {
        if (profiles == null) {
            return fallbackSender(senderId);
        }
        AccountClient.PublicUserProfile profile = profiles.get(senderId);
        if (profile == null) {
            return fallbackSender(senderId);
        }
        return ChatMessageResponse.Sender.builder()
                .userId(profile.keycloakId())
                .fullName(profile.fullName())
                .email(profile.email())
                .avatarUrl(profile.avatarUrl())
                .build();
    }

    private static ChatMessageResponse.Sender fallbackSender(String senderId) {
        if (senderId == null) {
            return null;
        }
        if (senderId.startsWith("GUEST-")) {
            return ChatMessageResponse.Sender.builder()
                    .userId(senderId)
                    .fullName("Guest")
                    .email(null)
                    .avatarUrl(null)
                    .build();
        }
        if ("admin-support".equals(senderId) || "admin-keycloak-id-0000".equals(senderId)) {
            return ChatMessageResponse.Sender.builder()
                    .userId(senderId)
                    .fullName("Support")
                    .email(null)
                    .avatarUrl(null)
                    .build();
        }
        return null;
    }
}
