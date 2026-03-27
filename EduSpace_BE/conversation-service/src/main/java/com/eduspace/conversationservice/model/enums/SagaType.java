package com.eduspace.conversationservice.model.enums;

import lombok.Getter;

@Getter
public enum SagaType {
    CREATE_CONVERSATION("CreateConversationSaga"),
    FIND_STAFF("FindStaffSaga"),
    SEND_MESSAGE("SendMessageSaga");

    private final String value;

    SagaType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SagaType fromValue(String value) {
        for (SagaType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown SagaType value: " + value);
    }
}
