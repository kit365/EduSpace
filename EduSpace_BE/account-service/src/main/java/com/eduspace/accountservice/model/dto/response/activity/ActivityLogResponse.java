package com.eduspace.accountservice.model.dto.response.activity;

import com.eduspace.accountservice.common.enums.ActivityLogEventType;
import com.eduspace.accountservice.common.enums.ActivityLogStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ActivityLogResponse {
    Long id;
    ActivityLogEventType eventType;
    ActivityLogStatus status;
    String actorUserId;
    String actorEmail;
    String message;
    String ipAddress;
    String userAgent;
    String metadata;
    LocalDateTime createdAt;
}
