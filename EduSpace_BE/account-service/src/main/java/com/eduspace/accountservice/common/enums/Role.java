package com.eduspace.accountservice.common.enums;

import lombok.Getter;

@Getter
public enum Role {
    STUDENT("STUDENT"),
    TUTOR("TUTOR"),
    ADMIN("ADMIN");

    private final String name;

    Role(String name) {
        this.name = name;
    }
}
