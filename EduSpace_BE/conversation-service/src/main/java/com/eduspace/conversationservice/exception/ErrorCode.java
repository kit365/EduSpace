package com.eduspace.conversationservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "UNCATEGORIZED_EXCEPTION", "error.uncategorized"),
    CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "conversation.not-found"),
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND", "message.not-found"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "error.unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "error.forbidden"),
    INVALID_REACTION(HttpStatus.BAD_REQUEST, "INVALID_REACTION", "message.reaction.invalid"),
    PARTICIPANT_NOT_FOUND(HttpStatus.NOT_FOUND, "PARTICIPANT_NOT_FOUND", "conversation.participant-not-found"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "user.not-found"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "error.invalid-request"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "error.access-denied"),
    SELF_CHAT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "SELF_CHAT_NOT_ALLOWED", "conversation.self-chat-not-allowed"),
    CONVERSATION_BLOCKED(HttpStatus.BAD_REQUEST, "CONVERSATION_BLOCKED", "conversation.blocked"),
    ONLY_OWNER_CAN_DELETE(HttpStatus.FORBIDDEN, "ONLY_OWNER_CAN_DELETE", "message.delete.only-owner"),
    ONLY_OWNER_CAN_EDIT(HttpStatus.FORBIDDEN, "ONLY_OWNER_CAN_EDIT", "message.edit.only-owner");

    ErrorCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;
}
