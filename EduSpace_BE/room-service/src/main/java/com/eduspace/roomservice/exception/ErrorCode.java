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
    ADS_PACKAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "ADS_PACKAGE_NOT_FOUND", "ads-package.not-found"),
    ROOM_SLOT_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_SLOT_NOT_FOUND", "room-slot.not-found"),
    AMENITY_NOT_FOUND(HttpStatus.NOT_FOUND, "AMENITY_NOT_FOUND", "amenity.not-found"),
    ROOM_AMENITY_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_AMENITY_NOT_FOUND", "room-amenity.not-found"),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "REVIEW_NOT_FOUND", "review.not-found"),
    ROOM_AD_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_AD_NOT_FOUND", "room-ad.not-found"),
    SYSTEM_CALENDAR_RULE_NOT_FOUND(HttpStatus.NOT_FOUND, "SYSTEM_CALENDAR_RULE_NOT_FOUND", "system-calendar-rule.not-found"),
    ROOM_BLOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_BLOCK_NOT_FOUND", "room-block.not-found"),
    EXTRA_SERVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "EXTRA_SERVICE_NOT_FOUND", "extra-service.not-found");

    ErrorCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;
}

