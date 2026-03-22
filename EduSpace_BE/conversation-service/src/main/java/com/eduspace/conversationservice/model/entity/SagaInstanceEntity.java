package com.eduspace.conversationservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "saga_instances")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SagaInstanceEntity {

    public enum Status {
        STARTED,
        COMPLETED,
        FAILED
    }

    @Id
    @Column(name = "saga_id")
    String id;

    @Column(name = "saga_type", nullable = false)
    String sagaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    Status status;

    @Column(name = "current_step")
    String currentStep;

    @Column(name = "payload", columnDefinition = "TEXT")
    String payload;

    @Column(name = "started_at", nullable = false)
    LocalDateTime startedAt;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    @PrePersist
    void onCreate() {
        if (startedAt == null) startedAt = LocalDateTime.now();
        if (status == null) status = Status.STARTED;
    }
}

