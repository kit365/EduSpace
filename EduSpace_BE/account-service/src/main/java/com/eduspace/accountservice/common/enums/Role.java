package com.eduspace.accountservice.common.enums;

import lombok.Getter;

@Getter
public enum Role {
    GUEST("GUEST"),
    HOST("HOST"),
    ADMIN("ADMIN");

    private final String name;

    Role(String name) {
        this.name = name;
    }
}
