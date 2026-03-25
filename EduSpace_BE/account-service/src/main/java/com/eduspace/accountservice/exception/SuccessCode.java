package com.eduspace.accountservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum SuccessCode {
    USER_REGISTER_SUCCESS(HttpStatus.CREATED, "USER_REGISTER_SUCCESS", "user.register.success"),
    USER_LOGIN_SUCCESS(HttpStatus.OK, "USER_LOGIN_SUCCESS", "user.login.success"),
    USER_PROFILE_GET_SUCCESS(HttpStatus.OK, "USER_PROFILE_GET_SUCCESS", "user.profile.get.success"),
    USER_PROFILE_UPDATE_SUCCESS(HttpStatus.OK, "USER_PROFILE_UPDATE_SUCCESS", "user.profile.update.success"),
    USER_LOGOUT_SUCCESS(HttpStatus.OK, "USER_LOGOUT_SUCCESS", "user.logout.success"),
    EMAIL_VERIFY_SUCCESS(HttpStatus.OK, "EMAIL_VERIFY_SUCCESS", "user.email.verify.success"),
    EKYC_VERIFY_SUCCESS(HttpStatus.OK, "EKYC_VERIFY_SUCCESS", "user.ekyc.verify.success");

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;

    SuccessCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }
}
