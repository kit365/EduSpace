package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.role.PermissionResponse;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Danh mục quyền cho Host Console (/rental) — Host & Manager đọc được (checkbox theo nhóm).
 */
@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.HOST + "/permissions")
@RequiredArgsConstructor
public class HostPermissionController {

    private final PermissionRepository permissionRepository;

    @GetMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_AUTHORITY_RBAC_PERMISSION_VIEW)
    public ApiResponse<List<PermissionResponse>> listAll() {
        List<PermissionResponse> list = permissionRepository.findAllOrderedByGroupAndName().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(list);
    }

    private PermissionResponse toResponse(PermissionEntity p) {
        return PermissionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .groupName(p.getGroupName())
                .build();
    }
}
