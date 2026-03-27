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
        ChatMessageResponse response = new ChatMessageResponse();
        response.setMessageId(entity.getId());
        response.setConversationId(entity.getConversation() != null ? entity.getConversation().getId() : null);
        response.setContent(entity.getContent());
        response.setMessageType(entity.getMessageType() != null ? entity.getMessageType().name() : null);
        response.setSentAt(entity.getSentAt());
        response.setIsRead(entity.getIsRead());
        response.setReadAt(entity.getReadAt());
        response.setIsDeleted(entity.getIsDeleted());
        response.setEditedAt(entity.getEditedAt());
        response.setMediaUrl(entity.getMediaUrl());
        response.setMediaType(entity.getMediaType());
        response.setReactions(entity.getReactions());
        response.setReplyToMessageId(entity.getReplyToMessageId());
        response.setSender(mapSender(entity.getSenderId(), profiles));
        return response;
    }

    public ChatMessageResponse.Sender mapSender(String senderId, Map<String, AccountClient.PublicUserProfile> profiles) {
        if (profiles == null) {
            return fallbackSender(senderId);
        }
        AccountClient.PublicUserProfile profile = profiles.get(senderId);
        if (profile == null) {
            return fallbackSender(senderId);
        }
        ChatMessageResponse.Sender sender = new ChatMessageResponse.Sender();
        sender.setUserId(profile.keycloakId());
        sender.setFullName(profile.fullName());
        sender.setEmail(profile.email());
        sender.setAvatarUrl(profile.avatarUrl());
        return sender;
    }

    private static ChatMessageResponse.Sender fallbackSender(String senderId) {
        if (senderId == null) {
            return null;
        }
        if (senderId.startsWith("GUEST-")) {
            ChatMessageResponse.Sender sender = new ChatMessageResponse.Sender();
            sender.setUserId(senderId);
            sender.setFullName("Guest");
            sender.setEmail(null);
            sender.setAvatarUrl(null);
            return sender;
        }
        if ("admin-support".equals(senderId) || "admin-keycloak-id-0000".equals(senderId)) {
            ChatMessageResponse.Sender sender = new ChatMessageResponse.Sender();
            sender.setUserId(senderId);
            sender.setFullName("Support");
            sender.setEmail(null);
            sender.setAvatarUrl(null);
            return sender;
        }
        return null;
    }
}
