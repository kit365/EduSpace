package com.eduspace.accountservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "UNCATEGORIZED_EXCEPTION", "error.uncategorized"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_ALREADY_EXISTS", "user.already-exists"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "user.not-found"),
    INVALID_KEY(HttpStatus.BAD_REQUEST, "INVALID_KEY", "error.invalid-key"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "error.unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "error.forbidden"),
    VERIFICATION_TOKEN_INVALID(HttpStatus.BAD_REQUEST, "VERIFICATION_TOKEN_INVALID",
            "error.verification.token-invalid"),
    VERIFICATION_TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "VERIFICATION_TOKEN_EXPIRED",
            "error.verification.token-expired"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED", "error.email.not-verified"),
    EMAIL_ALREADY_VERIFIED(HttpStatus.CONFLICT, "EMAIL_ALREADY_VERIFIED", "error.verification.already-verified"),
    REQUIRE_2FA(HttpStatus.FORBIDDEN, "REQUIRE_2FA", "error.require.2fa"),
    INVALID_2FA_CODE(HttpStatus.BAD_REQUEST, "INVALID_2FA_CODE", "error.invalid.2fa.code"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "error.resource-not-found"),
    HOST_ALREADY_PARTNER(HttpStatus.CONFLICT, "HOST_ALREADY_PARTNER", "host.application.already-partner"),
    HOST_APPLICATION_PENDING_EXISTS(HttpStatus.CONFLICT, "HOST_APPLICATION_PENDING_EXISTS",
            "host.application.pending-exists"),
    HOST_APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "HOST_APPLICATION_NOT_FOUND", "host.application.not-found"),
    HOST_APPLICATION_BAD_STATE(HttpStatus.BAD_REQUEST, "HOST_APPLICATION_BAD_STATE", "host.application.bad-state"),

    // eKYC related
    EKYC_VERIFICATION_FAILED(HttpStatus.BAD_REQUEST, "EKYC_VERIFICATION_FAILED", "error.ekyc.verification-failed"),
    EKYC_AI_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "EKYC_AI_UNAVAILABLE", "error.ekyc.ai-unavailable"),
    EKYC_INVALID_DOCUMENTS(HttpStatus.BAD_REQUEST, "EKYC_INVALID_DOCUMENTS", "error.ekyc.invalid-documents"),
    EKYC_REQUIRED(HttpStatus.FORBIDDEN, "EKYC_REQUIRED", "error.ekyc.required"),

    // RBAC & Staff management
    HOST_STAFF_FORBIDDEN(HttpStatus.FORBIDDEN, "HOST_STAFF_FORBIDDEN", "host.staff.forbidden"),
    HOST_STAFF_NOT_FOUND(HttpStatus.NOT_FOUND, "HOST_STAFF_NOT_FOUND", "host.staff.not-found"),
    INVALID_STAFF_PERMISSION(HttpStatus.BAD_REQUEST, "INVALID_STAFF_PERMISSION", "host.staff.invalid-permission"),
    HOST_MANAGER_INVALID_USER(HttpStatus.BAD_REQUEST, "HOST_MANAGER_INVALID_USER", "host.manager.invalid-user"),
    HOST_MANAGER_ALREADY_LINKED(HttpStatus.CONFLICT, "HOST_MANAGER_ALREADY_LINKED", "host.manager.already-linked");

    ErrorCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;
}
