package com.eduspace.accountservice.model.dto.response.user;

import com.eduspace.accountservice.common.enums.VerificationStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;
    /** Keycloak subject; same id used in conversation-service participant ids and JWT `sub`. */
    String keycloakId;
    String email;
    String fullName;
    String phoneNumber;
    String avatarUrl;
    String studentId;
    String location;
    String dateOfBirth;
    String shortBio;
    String cityState;
    String district;
    String ward;
    String streetAddress;
    String postalCode;
    String taxId;
    String hostType;
    String organizationName;
    VerificationStatus verificationStatus;
    
    // Verified Identity Data (from eKYC)
    String legalName;
    String idCardNumber;
    java.time.LocalDate dob;
    String verifiedAddress;
    String idCardFrontUrl;

    Boolean isActive;
    Boolean isEmailVerified;
    Boolean is2faEnabled;
    Integer pointBalance;
    Set<String> roles;
    /** Quyền gán qua các role (tên permission trong DB, ví dụ view_rooms, branch.room.view). */
    Set<String> permissions;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String createdBy;
    String updatedBy;

    // AI logic results
    OcrData ocrData;
    Double faceMatchPercentage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrData {
        String name;
        String idNumber;
        String dob;
        String address;
    }
}
