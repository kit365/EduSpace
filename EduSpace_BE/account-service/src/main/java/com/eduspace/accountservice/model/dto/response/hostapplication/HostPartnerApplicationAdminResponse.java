package com.eduspace.accountservice.model.dto.response.hostapplication;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class HostPartnerApplicationAdminResponse {
    UUID id;
    String userId;
    String applicantType;
    String fullName;
    String phone;
    String email;
    String address;
    String message;
    String status;
    String adminNote;
    LocalDateTime createdAt;
    LocalDateTime reviewedAt;
    String reviewedBy;
    String bankAccountNumber;
    String bankName;
    String bankAccountHolder;
    String taxId;
    String documentFrontUrl;
    String documentBackUrl;
    String businessLicenseUrl;
}
