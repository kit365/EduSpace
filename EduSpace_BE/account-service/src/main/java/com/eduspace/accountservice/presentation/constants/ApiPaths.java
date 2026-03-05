package com.eduspace.accountservice.presentation.constants;

public final class ApiPaths {

    private ApiPaths() {
    }

    public static final String API = "/api";
    public static final String VERSION = "/v1";
    public static final String BASE = API + VERSION;

    public static final class Auth {
        private Auth() {
        }

        public static final String BASE_PATH = BASE + "/auth";
        public static final String REGISTER = "/register";
        public static final String LOGIN = "/login";
        public static final String VERIFY_EMAIL = "/verify-email";
        public static final String REFRESH = "/refresh";
        public static final String LOGOUT = "/logout";
    }

    public static final class Account {
        private Account() {
        }

        public static final String BASE_PATH = BASE + "/accounts";
        public static final String ME = "/me";
    }
}
