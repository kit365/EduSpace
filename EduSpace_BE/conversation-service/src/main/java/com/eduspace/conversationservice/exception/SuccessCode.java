package com.eduspace.conversationservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum SuccessCode {
    CONVERSATION_CREATE_SUCCESS(HttpStatus.CREATED, "CONVERSATION_CREATE_SUCCESS", "conversation.create.success"),
    CONVERSATION_GET_SUCCESS(HttpStatus.OK, "CONVERSATION_GET_SUCCESS", "conversation.get.success"),
    MESSAGE_SEND_SUCCESS(HttpStatus.CREATED, "MESSAGE_SEND_SUCCESS", "message.send.success"),
    MESSAGE_DELETE_SUCCESS(HttpStatus.OK, "MESSAGE_DELETE_SUCCESS", "message.delete.success"),
    MESSAGE_EDIT_SUCCESS(HttpStatus.OK, "MESSAGE_EDIT_SUCCESS", "message.edit.success"),
    REACTION_ADD_SUCCESS(HttpStatus.OK, "REACTION_ADD_SUCCESS", "message.reaction.add.success"),
    MEDIA_UPLOAD_SUCCESS(HttpStatus.OK, "MEDIA_UPLOAD_SUCCESS", "media.upload.success");

    private final HttpStatus httpStatus;
    private final String code;
    private final String messageKey;

    SuccessCode(HttpStatus httpStatus, String code, String messageKey) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.messageKey = messageKey;
    }
}
