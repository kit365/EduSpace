package com.eduspace.accountservice.common;

import java.util.Collections;
import java.util.Set;

/**
 * Permissions a HOST may assign to STAFF users (Level-2 operational RBAC).
 * Must stay in sync with {@code staffOperationalCatalog.ts} on the frontend.
 */
public final class StaffOperationalAllowlist {

    private static final Set<String> ALLOWED = Set.of(
            "view_dashboard",
            "view_messages",
            "manage_messages",
            "branch.room.view",
            "branch.room_status.manage",
            "branch.cleaning.manage",
            "branch.maintenance.manage",
            "branch.booking.view",
            "branch.booking.manage",
            "branch.checkin.manage",
            "branch.checkout.manage",
            "branch.finance.view",
            "branch.finance.manage",
            "branch.finance.export");

    private StaffOperationalAllowlist() {
    }

    public static Set<String> allowedPermissionNames() {
        return Collections.unmodifiableSet(ALLOWED);
    }

    public static boolean isAllowed(String permissionName) {
        if (permissionName == null || permissionName.isBlank()) {
            return false;
        }
        return ALLOWED.contains(permissionName.trim());
    }
}
