package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.RolePermissionService;
import com.eduspace.accountservice.model.dto.request.permission.UpdateRolePermissionsRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.role.RoleResponse;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.ADMIN + "/roles")
@RequiredArgsConstructor
public class AdminRolePermissionController {

    private final RolePermissionService rolePermissionService;

    @PutMapping("/{roleId}/permissions")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<RoleResponse> replaceRolePermissions(
            @PathVariable Long roleId,
            @RequestBody UpdateRolePermissionsRequest request) {
        return ApiResponse.success(rolePermissionService.replaceRolePermissions(roleId, request));
    }

    /**
     * @param mode {@code merge} (default) adds template permissions to the role; {@code replace} clears role permissions first.
     */
    @PostMapping("/{roleId}/permissions/apply-template/{templateId}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<RoleResponse> applyTemplate(
            @PathVariable Long roleId,
            @PathVariable Long templateId,
            @RequestParam(defaultValue = "merge") String mode) {
        boolean replace = "replace".equalsIgnoreCase(mode);
        return ApiResponse.success(rolePermissionService.applyTemplate(roleId, templateId, replace));
    }
}
