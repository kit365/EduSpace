package com.eduspace.conversationservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_assignment_offers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffAssignmentOfferEntity {

    public enum Status {
        PENDING,
        ACCEPTED,
        EXPIRED
    }

    @Id
    @Column(name = "offer_id")
    String id;

    @Column(name = "conversation_id", nullable = false)
    String conversationId;

    @Column(name = "saga_id", nullable = false)
    String sagaId;

    @Column(name = "staff_id", nullable = false)
    String staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    Status status;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "accepted_at")
    LocalDateTime acceptedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = Status.PENDING;
        }
    }
}
