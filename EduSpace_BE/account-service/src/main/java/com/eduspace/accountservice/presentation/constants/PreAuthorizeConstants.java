package com.eduspace.accountservice.presentation.constants;

public final class PreAuthorizeConstants {
    private PreAuthorizeConstants() {
    }

    public static final String HAS_ROLE_ADMIN = "hasRole('ADMIN')";

    /** Admin or Super Admin (for points, rewards, loyalty config, etc.) */
    public static final String HAS_ANY_ROLE_ADMIN_OR_SUPER = "hasAnyRole('ADMIN', 'SUPER_ADMIN')";
}
