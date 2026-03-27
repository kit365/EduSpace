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

    public LocalDateTime getLastActivityCompat() {
        return lastActivity;
    }

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

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getConversationName() { return conversationName; }
    public void setConversationName(String conversationName) { this.conversationName = conversationName; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Boolean getIsAdminConversation() { return isAdminConversation; }
    public void setIsAdminConversation(Boolean adminConversation) { isAdminConversation = adminConversation; }
    public Boolean getVideoCallEnabled() { return videoCallEnabled; }
    public void setVideoCallEnabled(Boolean videoCallEnabled) { this.videoCallEnabled = videoCallEnabled; }
    public int getTotalMessageCount() { return totalMessageCount; }
    public void setTotalMessageCount(int totalMessageCount) { this.totalMessageCount = totalMessageCount; }
    public int getCallHistoryCount() { return callHistoryCount; }
    public void setCallHistoryCount(int callHistoryCount) { this.callHistoryCount = callHistoryCount; }
    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsBlocked() { return isBlocked; }
    public void setIsBlocked(Boolean blocked) { isBlocked = blocked; }
    public Boolean getIsBlockedByMe() { return isBlockedByMe; }
    public void setIsBlockedByMe(Boolean blockedByMe) { isBlockedByMe = blockedByMe; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public OtherUser getOtherUser() { return otherUser; }
    public void setOtherUser(OtherUser otherUser) { this.otherUser = otherUser; }
}

