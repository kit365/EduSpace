package com.eduspace.apigatewayservice.common.enums;

import lombok.Getter;

@Getter
public enum Role {
    GUEST("GUEST"),
    HOST("HOST"),
    MANAGER("MANAGER"),
    ADMIN("ADMIN"),
    SUPER_ADMIN("SUPER_ADMIN");

    private final String name;

    Role(String name) {
        this.name = name;
    }
}
