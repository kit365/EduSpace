package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.permission.UpdateRolePermissionsRequest;
import com.eduspace.accountservice.model.dto.response.role.RoleResponse;

/**
 * Assigns application-level permissions to roles (stored in {@code roles_permissions}).
 * <p><b>Enforcement note:</b> API authorization today uses Keycloak realm roles ({@code ADMIN}, etc.).
 * Fine-grained checks ({@code hasAuthority('view_users')}) are a separate backlog item
 * (JWT claims or per-request permission load).
 */
public interface RolePermissionService {

    RoleResponse replaceRolePermissions(Long roleId, UpdateRolePermissionsRequest request);

    RoleResponse applyTemplate(Long roleId, Long templateId, boolean replace);
}
