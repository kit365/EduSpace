package com.eduspace.accountservice.presentation.constants;

public final class AuthPaths {
    private AuthPaths() {
    }

    public static final String BASE_PATH = BaseApiPaths.BASE + "/auth";
    public static final String REGISTER = "/register";
    public static final String LOGIN = "/login";
    public static final String VERIFY_EMAIL = "/verify-email";
    public static final String REFRESH = "/refresh";
    public static final String LOGOUT = "/logout";
}
