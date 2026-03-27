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
        ConversationResponse response = new ConversationResponse();
        response.setConversationId(entity.getId());
        response.setConversationName(entity.getConversationName());
        response.setIsActive(entity.getIsActive());
        response.setIsAdminConversation(entity.getIsAdminConversation());
        response.setVideoCallEnabled(entity.getVideoCallEnabled());
        response.setTotalMessageCount(entity.getTotalMessageCount() != null ? entity.getTotalMessageCount() : 0);
        response.setCallHistoryCount(entity.getCallHistoryCount() != null ? entity.getCallHistoryCount() : 0);
        response.setLastActivity(entity.getLastActivity());
        response.setCreatedAt(entity.getCreatedAt());
        response.setOtherUser(otherUser);
        response.setUnreadCount(unreadCount);
        response.setLastMessage(lastMessagePreview);
        response.setIsBlocked(entity.isBlocked());
        response.setIsBlockedByMe(entity.isBlockedBy(currentUserId));
        return response;
    }

    public ConversationEntity toEntity(String user1Id,
                                       String user2Id,
                                       String conversationName,
                                       boolean isAdminConversation,
                                       boolean isActive,
                                       String sagaId) {
        ConversationEntity entity = new ConversationEntity();
        entity.setUser1Id(user1Id);
        entity.setUser2Id(user2Id);
        entity.setConversationName(conversationName);
        entity.setIsAdminConversation(isAdminConversation);
        entity.setIsActive(isActive);
        entity.setVideoCallEnabled(true);
        entity.setTotalMessageCount(0);
        entity.setCallHistoryCount(0);
        entity.setLastActivity(LocalDateTime.now());
        entity.setSagaId(sagaId);
        entity.setBlockedByUser1(false);
        entity.setBlockedByUser2(false);
        return entity;
    }

    public ConversationResponse.OtherUser mapOtherUser(AccountClient.PublicUserProfile profile, boolean isAdminConversation, String supportAdminKeycloakId) {
        if (profile != null) {
            ConversationResponse.OtherUser otherUser = new ConversationResponse.OtherUser();
            otherUser.setUserId(profile.keycloakId());
            otherUser.setFullName(profile.fullName());
            otherUser.setEmail(profile.email());
            otherUser.setAvatarUrl(profile.avatarUrl());
            return otherUser;
        } else if (isAdminConversation) {
            ConversationResponse.OtherUser otherUser = new ConversationResponse.OtherUser();
            otherUser.setUserId(supportAdminKeycloakId);
            otherUser.setFullName("EduSpace Support");
            otherUser.setEmail(null);
            otherUser.setAvatarUrl(null);
            return otherUser;
        }
        return null;
    }
}
