package com.eduspace.accountservice.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;
    /** Optional detail (e.g. Keycloak {@code error_description}) shown to the client instead of i18n key. */
    private final String detailMessage;

    public AppException(ErrorCode errorCode) {
        this(errorCode, null);
    }

    public AppException(ErrorCode errorCode, String detailMessage) {
        super(detailMessage != null && !detailMessage.isBlank() ? detailMessage : errorCode.getMessageKey());
        this.errorCode = errorCode;
        this.detailMessage = detailMessage;
    }
}
