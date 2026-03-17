package com.eduspace.accountservice.model.dto.response;

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
    String email;
    String fullName;
    String phoneNumber;
    String avatarUrl;
    String location;
    String shortBio;
    String hostType;
    String verificationDocument;
    String verificationStatus;
    Boolean isActive;
    Boolean isEmailVerified;
    Boolean is2faEnabled;
    Set<String> roles;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
