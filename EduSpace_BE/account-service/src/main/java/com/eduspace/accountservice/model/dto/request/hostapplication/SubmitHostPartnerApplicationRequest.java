package com.eduspace.accountservice.model.dto.request.hostapplication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmitHostPartnerApplicationRequest {

    @NotBlank
    @Size(max = 32)
    String applicantType;

    @NotBlank
    @Size(max = 255)
    String fullName;

    @Size(max = 50)
    String phone;

    @NotBlank
    @Email
    String email;

    String address;

    String message;

    /** URL ảnh CCCD mặt trước (tạm — sau thay bằng upload) */
    String documentFrontUrl;

    String documentBackUrl;

    String businessLicenseUrl;

    String bankAccountNumber;

    String bankName;

    String bankAccountHolder;

    String taxId;
}
