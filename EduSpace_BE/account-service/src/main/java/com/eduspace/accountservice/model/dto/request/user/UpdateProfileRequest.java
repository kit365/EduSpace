package com.eduspace.accountservice.model.dto.request.user;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {

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
}
