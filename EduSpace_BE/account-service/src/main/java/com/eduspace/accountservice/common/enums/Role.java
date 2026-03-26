package com.eduspace.accountservice.common.enums;

import lombok.Getter;

@Getter
public enum Role {
    GUEST("GUEST"),
    HOST("HOST"),
    MANAGER("MANAGER"),
    /** Branch/operational staff managed by HOST (Level-2 RBAC). */
    STAFF("STAFF"),
    ADMIN("ADMIN"),
    SUPER_ADMIN("SUPER_ADMIN");

    private final String name;

    Role(String name) {
        this.name = name;
    }
}
