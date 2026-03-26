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
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
