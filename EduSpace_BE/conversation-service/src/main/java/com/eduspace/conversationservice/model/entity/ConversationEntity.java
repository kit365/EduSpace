package com.eduspace.conversationservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "conversation_id")
    String id;

    @Column(name = "user1_id", nullable = false, length = 36)
    String user1Id;

    @Column(name = "user2_id", nullable = false, length = 36)
    String user2Id;

    @Column(name = "conversation_name")
    String conversationName;

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_admin_conversation")
    Boolean isAdminConversation = false;

    @Builder.Default
    @Column(name = "video_call_enabled")
    Boolean videoCallEnabled = true;

    @Builder.Default
    @Column(name = "total_message_count")
    Integer totalMessageCount = 0;

    @Builder.Default
    @Column(name = "call_history_count")
    Integer callHistoryCount = 0;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "last_activity")
    LocalDateTime lastActivity;

    @Builder.Default
    @Column(name = "blocked_by_user1")
    Boolean blockedByUser1 = false;

    @Builder.Default
    @Column(name = "blocked_by_user2")
    Boolean blockedByUser2 = false;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastActivity == null) {
            lastActivity = createdAt;
        }
    }

    @PreUpdate
    void onUpdate() {
        if (lastActivity == null) {
            lastActivity = LocalDateTime.now();
        }
    }

    public boolean isParticipant(String userId) {
        return user1Id.equals(userId) || user2Id.equals(userId);
    }

    public String otherUserId(String currentUserId) {
        if (user1Id.equals(currentUserId)) return user2Id;
        if (user2Id.equals(currentUserId)) return user1Id;
        return null;
    }

    public boolean isBlocked() {
        return Boolean.TRUE.equals(blockedByUser1) || Boolean.TRUE.equals(blockedByUser2);
    }

    public boolean isBlockedBy(String userId) {
        if (user1Id.equals(userId)) return Boolean.TRUE.equals(blockedByUser1);
        if (user2Id.equals(userId)) return Boolean.TRUE.equals(blockedByUser2);
        return false;
    }

    public void blockBy(String userId) {
        if (user1Id.equals(userId)) blockedByUser1 = true;
        else if (user2Id.equals(userId)) blockedByUser2 = true;
    }

    public void unblockBy(String userId) {
        if (user1Id.equals(userId)) blockedByUser1 = false;
        else if (user2Id.equals(userId)) blockedByUser2 = false;
    }

    public void incrementMessageCount() {
        totalMessageCount = (totalMessageCount == null ? 0 : totalMessageCount) + 1;
        lastActivity = LocalDateTime.now();
    }

    public void incrementCallCount() {
        callHistoryCount = (callHistoryCount == null ? 0 : callHistoryCount) + 1;
        lastActivity = LocalDateTime.now();
    }
}

