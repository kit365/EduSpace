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
        public static final String PUBLIC_PROFILE = "/{userId}/public";
        public static final String PUBLIC_BATCH = "/public/batch";
        public static final String PUBLIC_BY_KEYCLOAK = "/public/by-keycloak/{keycloakId}";
        public static final String PUBLIC_BY_KEYCLOAK_BATCH = "/public/by-keycloak/batch";
        public static final String PUBLIC_SEARCH = "/public/search";
    }
}
