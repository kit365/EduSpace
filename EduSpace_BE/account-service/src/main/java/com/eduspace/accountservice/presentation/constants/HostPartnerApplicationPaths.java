package com.eduspace.accountservice.presentation.constants;

/**
 * REST paths cho đơn đăng ký đối tác cho thuê.
 * Base: {@code /api/v1/accounts/host-applications}
 */
public final class HostPartnerApplicationPaths {

    private HostPartnerApplicationPaths() {
    }

    public static final String BASE = AccountPaths.BASE_PATH + "/host-applications";

    /** GET/POST — user đã đăng nhập */
    public static final String ME = "/me";
    public static final String ME_PENDING_BRANCH_UPDATES = ME + "/pending-branch-updates";

    /** Prefix admin — cần quyền ADMIN / SUPER_ADMIN */
    public static final String ADMIN = "/admin";

    public static final String ADMIN_PENDING = ADMIN + "/pending";

    public static final String ADMIN_APPROVE = ADMIN + "/{id}/approve";

    public static final String ADMIN_REJECT = ADMIN + "/{id}/reject";
}
