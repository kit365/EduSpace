package com.eduspace.accountservice.model.dto.response.hostapplication;

import com.eduspace.accountservice.common.enums.HostPartnerApplicationUserStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class MyHostApplicationStatusResponse {
    HostPartnerApplicationUserStatus status;
    UUID applicationId;
    String rejectedReason;
    LocalDateTime submittedAt;
}
