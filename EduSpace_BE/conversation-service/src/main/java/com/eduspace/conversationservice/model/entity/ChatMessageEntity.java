package com.eduspace.conversationservice.model.entity;

import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.infrastructure.persistence.converter.JsonMapConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    @Column(name = "sender_id", nullable = false, length = 100)
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
    @Convert(converter = JsonMapConverter.class)
    Map<String, List<String>> reactions;

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

    public String getId() {
        return id;
    }

    public ConversationEntity getConversation() {
        return conversation;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getContent() {
        return content;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public LocalDateTime getEditedAt() {
        return editedAt;
    }

    public Map<String, List<String>> getReactions() {
        return reactions;
    }

    public String getReplyToMessageId() {
        return replyToMessageId;
    }

    public void setReactions(Map<String, List<String>> reactions) {
        this.reactions = reactions;
    }

    public void setConversation(ConversationEntity conversation) {
        this.conversation = conversation;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}

