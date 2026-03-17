package com.eduspace.accountservice.presentation.constants;

public final class AccountPaths {
    private AccountPaths() {
    }

    public static final String BASE_PATH = BaseApiPaths.BASE + "/accounts";
    public static final String ME = "/me";
    public static final String PASSWORD = "/password";
    public static final String TWO_FA_SETUP = "/2fa/setup";
    public static final String TWO_FA_ENABLE = "/2fa/enable";
    public static final String TWO_FA_DISABLE = "/2fa/disable";
    public static final String ADMIN = "/admin";
    public static final String USERS = "/users";
}
