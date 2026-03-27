package com.eduspace.roomservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum SuccessCode {
    SUCCESS(HttpStatus.OK, "SUCCESS", "success");

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;

    SuccessCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }
}

