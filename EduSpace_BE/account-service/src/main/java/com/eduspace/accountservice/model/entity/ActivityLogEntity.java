package com.eduspace.accountservice.model.entity;

import com.eduspace.accountservice.common.enums.ActivityLogEventType;
import com.eduspace.accountservice.common.enums.ActivityLogStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ActivityLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    ActivityLogEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    ActivityLogStatus status;

    @Column(name = "actor_user_id")
    String actorUserId;

    @Column(name = "actor_email")
    String actorEmail;

    @Column(nullable = false, length = 500)
    String message;

    @Column(name = "ip_address", length = 64)
    String ipAddress;

    @Column(name = "user_agent", length = 512)
    String userAgent;

    @Column(columnDefinition = "TEXT")
    String metadata;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
