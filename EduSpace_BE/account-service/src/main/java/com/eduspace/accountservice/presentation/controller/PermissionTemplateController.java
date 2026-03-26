package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.PermissionTemplateService;
import com.eduspace.accountservice.model.dto.request.permission.PermissionTemplateRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.role.PermissionTemplateResponse;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.ADMIN + "/permission-templates")
@RequiredArgsConstructor
public class PermissionTemplateController {

    private final PermissionTemplateService permissionTemplateService;

    @GetMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<List<PermissionTemplateResponse>> list() {
        return ApiResponse.success(permissionTemplateService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<PermissionTemplateResponse> get(@PathVariable Long id) {
        return ApiResponse.success(permissionTemplateService.findById(id));
    }

    @PostMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<PermissionTemplateResponse> create(@RequestBody PermissionTemplateRequest request) {
        return ApiResponse.success(permissionTemplateService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<PermissionTemplateResponse> update(@PathVariable Long id,
                                                          @RequestBody PermissionTemplateRequest request) {
        return ApiResponse.success(permissionTemplateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        permissionTemplateService.delete(id);
        return ApiResponse.success(null);
    }
}
