package com.eduspace.conversationservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboxEventEntity {

    public enum Status {
        PENDING,
        SENT,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "outbox_id")
    Long id;

    @Column(name = "aggregate_type", nullable = false)
    String aggregateType;

    @Column(name = "aggregate_id", nullable = false, length = 60)
    String aggregateId;

    @Column(name = "event_type", nullable = false)
    String eventType;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    String payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    Status status;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "available_at", nullable = false)
    LocalDateTime availableAt;

    @Column(name = "sent_at")
    LocalDateTime sentAt;

    @Builder.Default
    @Column(name = "attempts", nullable = false)
    Integer attempts = 0;

    @Column(name = "last_error", columnDefinition = "TEXT")
    String lastError;

    @Column(name = "target_user_id", length = 60)
    String targetUserId;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (availableAt == null) availableAt = createdAt;
        if (status == null) status = Status.PENDING;
    }
}

