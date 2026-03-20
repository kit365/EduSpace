package com.eduspace.conversationservice.model.entity;

import com.eduspace.conversationservice.model.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "message_id")
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    ConversationEntity conversation;

    @Column(name = "sender_id", nullable = false, length = 36)
    String senderId;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 30)
    MessageType messageType;

    @Column(name = "sent_at")
    LocalDateTime sentAt;

    @Column(name = "media_url", columnDefinition = "TEXT")
    String mediaUrl;

    @Column(name = "media_type", length = 50)
    String mediaType;

    @Column(name = "media_size")
    Long mediaSize;

    @Builder.Default
    @Column(name = "is_read")
    Boolean isRead = false;

    @Column(name = "read_at")
    LocalDateTime readAt;

    @Column(name = "edited_at")
    LocalDateTime editedAt;

    @Builder.Default
    @Column(name = "is_deleted")
    Boolean isDeleted = false;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Column(name = "reactions", columnDefinition = "TEXT")
    String reactions;

    @Column(name = "reply_to_message_id", length = 36)
    String replyToMessageId;

    @PrePersist
    void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    public void markAsDeleted() {
        isDeleted = true;
        deletedAt = LocalDateTime.now();
    }

    public void editContent(String newContent) {
        content = newContent;
        editedAt = LocalDateTime.now();
    }
}

