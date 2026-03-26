package com.eduspace.conversationservice.infrastructure.mapper;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ConversationMapper {

    public ConversationResponse toResponse(ConversationEntity entity,
                                           String currentUserId,
                                           ConversationResponse.OtherUser otherUser,
                                           int unreadCount,
                                           String lastMessagePreview) {
        if (entity == null) {
            return null;
        }
        return ConversationResponse.builder()
                .conversationId(entity.getId())
                .conversationName(entity.getConversationName())
                .isActive(entity.getIsActive())
                .isAdminConversation(entity.getIsAdminConversation())
                .videoCallEnabled(entity.getVideoCallEnabled())
                .totalMessageCount(entity.getTotalMessageCount() != null ? entity.getTotalMessageCount() : 0)
                .callHistoryCount(entity.getCallHistoryCount() != null ? entity.getCallHistoryCount() : 0)
                .lastActivity(entity.getLastActivity())
                .createdAt(entity.getCreatedAt())
                .otherUser(otherUser)
                .unreadCount(unreadCount)
                .lastMessage(lastMessagePreview)
                .isBlocked(entity.isBlocked())
                .isBlockedByMe(entity.isBlockedBy(currentUserId))
                .build();
    }

    public ConversationEntity toEntity(String user1Id,
                                       String user2Id,
                                       String conversationName,
                                       boolean isAdminConversation,
                                       boolean isActive,
                                       String sagaId) {
        return ConversationEntity.builder()
                .user1Id(user1Id)
                .user2Id(user2Id)
                .conversationName(conversationName)
                .isAdminConversation(isAdminConversation)
                .isActive(isActive)
                .videoCallEnabled(true)
                .totalMessageCount(0)
                .callHistoryCount(0)
                .lastActivity(LocalDateTime.now())
                .sagaId(sagaId)
                .blockedByUser1(false)
                .blockedByUser2(false)
                .build();
    }

    public ConversationResponse.OtherUser mapOtherUser(AccountClient.PublicUserProfile profile, boolean isAdminConversation, String supportAdminKeycloakId) {
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
