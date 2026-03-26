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
    /** Host console (Partner Portal) — RBAC templates, etc. */
    public static final String HOST = "/host";
    public static final String USERS = "/users";

    public static final String PUBLIC_PROFILE = "/{userId}/public";
    public static final String PUBLIC_BATCH = "/public/batch";
    public static final String PUBLIC_BY_KEYCLOAK = "/public/by-keycloak/{keycloakId}";
    public static final String PUBLIC_BY_KEYCLOAK_BATCH = "/public/by-keycloak/batch";
    public static final String PUBLIC_BY_IDENTIFIER = "/public/by-identifier/{identifier}";
    public static final String PUBLIC_BY_IDENTIFIER_BATCH = "/public/by-identifier/batch";
    public static final String PUBLIC_SEARCH = "/public/search";
    public static final String PUBLIC_SUPPORT_ELIGIBLE_STAFF_COUNT = "/public/support/eligible-staff-count";
    public static final String PUBLIC_SUPPORT_ONLINE_STAFF_COUNT = "/public/support/online-staff-count";
    public static final String ME_SUPPORT_PRESENCE = ME + "/support-presence";
    /** POST multipart eKYC (front, optional back, selfie) — proxied to internal eduspace-ai (FastAPI) */
    public static final String EKYC_VERIFY = ME + "/ekyc/verify";
    /** POST JSON — lưu kết quả sau khi FE đã gọi Python trực tiếp (OCR + face); BE chỉ validate ngưỡng + persist */
    public static final String EKYC_COMMIT = ME + "/ekyc/commit";
}
