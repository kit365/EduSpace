package com.eduspace.conversationservice.infrastructure.mapper;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Map;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {

    @Mapping(target = "messageId", source = "entity.id")
    @Mapping(target = "conversationId", source = "entity.conversation.id")
    @Mapping(target = "sender", expression = "java(mapSender(entity.getSenderId(), profiles))")
    ChatMessageResponse toResponse(ChatMessageEntity entity, Map<String, AccountClient.PublicUserProfile> profiles);

    default ChatMessageResponse.Sender mapSender(String senderId, Map<String, AccountClient.PublicUserProfile> profiles) {
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
