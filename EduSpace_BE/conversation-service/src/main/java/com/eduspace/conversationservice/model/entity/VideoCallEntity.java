package com.eduspace.conversationservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_calls")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoCallEntity {

    public enum CallStatus {
        INITIATED,
        ACCEPTED,
        CONNECTED,
        DECLINED,
        ENDED,
        FAILED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "call_id")
    String id;

    @Column(name = "call_session_id", nullable = false, unique = true, length = 60)
    String callSessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    ConversationEntity conversation;

    @Column(name = "caller_id", nullable = false, length = 100)
    String callerId;

    @Column(name = "receiver_id", nullable = false, length = 100)
    String receiverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_status", nullable = false, length = 30)
    CallStatus callStatus;

    @Column(name = "started_at")
    LocalDateTime startedAt;

    @Column(name = "ended_at")
    LocalDateTime endedAt;

    @Column(name = "duration_minutes")
    Integer durationMinutes;

    @Column(name = "end_reason")
    String endReason;

    @Builder.Default
    @Column(name = "is_successful")
    Boolean isSuccessful = false;

    @PrePersist
    void onCreate() {
        if (startedAt == null) startedAt = LocalDateTime.now();
    }

    public void acceptCall() {
        callStatus = CallStatus.ACCEPTED;
    }

    public void declineCall(String reason) {
        callStatus = CallStatus.DECLINED;
        endReason = reason;
        endedAt = LocalDateTime.now();
    }

    public void endCall(String reason) {
        callStatus = CallStatus.ENDED;
        endReason = reason;
        endedAt = LocalDateTime.now();
        if (startedAt != null) {
            long minutes = java.time.Duration.between(startedAt, endedAt).toMinutes();
            durationMinutes = (int) Math.max(0, minutes);
        }
        isSuccessful = true;
    }
}

