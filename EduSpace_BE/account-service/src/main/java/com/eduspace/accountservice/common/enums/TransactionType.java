package com.eduspace.accountservice.common.enums;

import lombok.Getter;

@Getter
public enum TransactionType {
    EARN("Earn Points"),
    REDEEM("Redeem Points");

    private final String description;

    TransactionType(String description) {
        this.description = description;
    }
}
