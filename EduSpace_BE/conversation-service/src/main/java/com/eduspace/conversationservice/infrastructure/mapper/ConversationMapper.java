package com.eduspace.conversationservice.infrastructure.mapper;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConversationMapper {

    @Mapping(target = "conversationId", source = "entity.id")
    @Mapping(target = "conversationName", source = "entity.conversationName")
    @Mapping(target = "isActive", source = "entity.isActive")
    @Mapping(target = "isAdminConversation", source = "entity.isAdminConversation")
    @Mapping(target = "videoCallEnabled", source = "entity.videoCallEnabled")
    @Mapping(target = "totalMessageCount", source = "entity.totalMessageCount", defaultValue = "0")
    @Mapping(target = "callHistoryCount", source = "entity.callHistoryCount", defaultValue = "0")
    @Mapping(target = "lastActivity", source = "entity.lastActivity")
    @Mapping(target = "createdAt", source = "entity.createdAt")
    @Mapping(target = "otherUser", source = "otherUser")
    @Mapping(target = "unreadCount", source = "unreadCount")
    @Mapping(target = "lastMessage", source = "lastMessagePreview")
    @Mapping(target = "isBlocked", expression = "java(entity.isBlocked())")
    @Mapping(target = "isBlockedByMe", expression = "java(entity.isBlockedBy(currentUserId))")
    ConversationResponse toResponse(ConversationEntity entity,
                                    String currentUserId,
                                    ConversationResponse.OtherUser otherUser,
                                    int unreadCount,
                                    String lastMessagePreview);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user1Id", source = "user1Id")
    @Mapping(target = "user2Id", source = "user2Id")
    @Mapping(target = "conversationName", source = "conversationName")
    @Mapping(target = "isAdminConversation", source = "isAdminConversation")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "videoCallEnabled", constant = "true")
    @Mapping(target = "totalMessageCount", constant = "0")
    @Mapping(target = "callHistoryCount", constant = "0")
    @Mapping(target = "lastActivity", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "sagaId", source = "sagaId")
    @Mapping(target = "blockedByUser1", ignore = true)
    @Mapping(target = "blockedByUser2", ignore = true)
    ConversationEntity toEntity(String user1Id, String user2Id, String conversationName, boolean isAdminConversation, boolean isActive, String sagaId);

    default ConversationResponse.OtherUser mapOtherUser(AccountClient.PublicUserProfile profile, boolean isAdminConversation, String supportAdminKeycloakId) {
        if (profile != null) {
            return ConversationResponse.OtherUser.builder()
                    .userId(profile.keycloakId())
                    .fullName(profile.fullName())
                    .email(profile.email())
                    .avatarUrl(profile.avatarUrl())
                    .build();
        } else if (isAdminConversation) {
            return ConversationResponse.OtherUser.builder()
                    .userId(supportAdminKeycloakId)
                    .fullName("EduSpace Support")
                    .email(null)
                    .avatarUrl(null)
                    .build();
        }
        return null;
    }
}
