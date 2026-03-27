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
    PROPERTY_NOT_FOUND(HttpStatus.NOT_FOUND, "PROPERTY_NOT_FOUND", "property.not-found"),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "category.not-found"),
    AMENITY_NOT_FOUND(HttpStatus.NOT_FOUND, "AMENITY_NOT_FOUND", "amenity.not-found"),
    ROOM_AMENITY_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_AMENITY_NOT_FOUND", "room-amenity.not-found"),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "REVIEW_NOT_FOUND", "review.not-found"),
    SYSTEM_CALENDAR_RULE_NOT_FOUND(HttpStatus.NOT_FOUND, "SYSTEM_CALENDAR_RULE_NOT_FOUND", "system-calendar-rule.not-found"),
    ROOM_BLOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_BLOCK_NOT_FOUND", "room-block.not-found"),
    EXTRA_SERVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "EXTRA_SERVICE_NOT_FOUND", "extra-service.not-found"),

    ROOM_EDIT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "ROOM_EDIT_NOT_ALLOWED", "room.edit-not-allowed"),
    ROOM_PENDING_EDIT_MISSING(HttpStatus.BAD_REQUEST, "ROOM_PENDING_EDIT_MISSING", "room.pending-edit-missing");

    ErrorCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;
}

