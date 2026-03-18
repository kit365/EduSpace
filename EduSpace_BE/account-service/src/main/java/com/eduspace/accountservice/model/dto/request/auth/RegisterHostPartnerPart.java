package com.eduspace.accountservice.model.dto.request.auth;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/**
 * Gửi kèm {@link RegisterRequest} khi user chọn đăng ký làm host — tạo đơn PENDING cùng lúc với tài khoản.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterHostPartnerPart {

    String applicantType;

    String phone;

    String address;

    String documentFrontUrl;

    String documentBackUrl;

    String businessLicenseUrl;
}
