package com.eduspace.accountservice.presentation.constants;

public final class PreAuthorizeConstants {
    private PreAuthorizeConstants() {
    }

    public static final String HAS_ROLE_ADMIN = "hasRole('ADMIN')";

    /** Admin or Super Admin (for points, rewards, loyalty config, etc.) */
    public static final String HAS_ANY_ROLE_ADMIN_OR_SUPER = "hasAnyRole('ADMIN', 'SUPER_ADMIN')";
    public static final String HAS_ADMIN_PERMISSION_CATALOG_READ = HAS_ANY_ROLE_ADMIN_OR_SUPER;
    public static final String HAS_ADMIN_PERMISSION_CATALOG_WRITE = HAS_ANY_ROLE_ADMIN_OR_SUPER;

    /** Partner portal: xem danh mục quyền & bộ quyền (Host, Manager, Admin). */
    public static final String HAS_HOST_READ_RBAC = "hasAnyRole('HOST','MANAGER','ADMIN','SUPER_ADMIN')";

    /** Partner portal: tạo/sửa/xóa bộ quyền — Manager chỉ xem, không ghi. */
    public static final String HAS_HOST_WRITE_RBAC = "hasAnyRole('HOST','ADMIN','SUPER_ADMIN')";

    public static final String HAS_AUTHORITY_RBAC_PERMISSION_VIEW =
            "hasAuthority('rbac.permission.view') or hasAnyRole('HOST','MANAGER','ADMIN','SUPER_ADMIN')";
    public static final String HAS_AUTHORITY_RBAC_TEMPLATE_VIEW =
            "hasAuthority('rbac.template.view') or hasAnyRole('HOST','MANAGER','ADMIN','SUPER_ADMIN')";
    public static final String HAS_AUTHORITY_RBAC_TEMPLATE_MANAGE =
            "hasAuthority('rbac.template.manage') or hasAnyRole('HOST','ADMIN','SUPER_ADMIN')";
}
