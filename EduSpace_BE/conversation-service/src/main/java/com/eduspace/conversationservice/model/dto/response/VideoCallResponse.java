package com.eduspace.conversationservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoCallResponse {
    String callId;
    String callSessionId;
    String callStatus;
    LocalDateTime startedAt;
    LocalDateTime endedAt;
    Integer durationMinutes;
    String endReason;
    Boolean isSuccessful;
    String callerUserId;
    String receiverUserId;
    String conversationId;
}

