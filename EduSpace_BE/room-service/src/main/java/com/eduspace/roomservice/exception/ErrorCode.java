package com.eduspace.roomservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "UNCATEGORIZED_EXCEPTION", "error.uncategorized"),
    INVALID_KEY(HttpStatus.BAD_REQUEST, "INVALID_KEY", "error.invalid-key"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "error.unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "error.forbidden"),

    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "room.not-found"),
    FACILITY_NOT_FOUND(HttpStatus.NOT_FOUND, "FACILITY_NOT_FOUND", "facility.not-found");

    ErrorCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;
}

