package com.eduspace.conversationservice.model.enums;

import lombok.Getter;

// Dành cho việc "Ghi sổ" nội bộ (Database).
//dùng để lưu vào bảng SagaInstanceEntity của riêng thằng Chat Service,
// báo cho hệ thống biết: "Cái giao dịch này đang dừng ở bước nào rồi?".
@Getter
public enum SagaStep {
    VALIDATE_USERS("VALIDATE_USERS"),
    PERSIST_MESSAGE("PERSIST_MESSAGE");

    private final String value;

    SagaStep(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
