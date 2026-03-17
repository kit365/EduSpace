package com.eduspace.accountservice.model.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {

    String fullName;
    String phoneNumber;
    String avatarUrl;
    String location;
    String shortBio;
}
