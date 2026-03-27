package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.permission.PermissionCatalogRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.role.PermissionResponse;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.ADMIN + "/permissions")
@RequiredArgsConstructor
public class AdminPermissionController {

    private final PermissionRepository permissionRepository;

    @GetMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ADMIN_PERMISSION_CATALOG_READ)
    public ApiResponse<List<PermissionResponse>> listAll() {
        List<PermissionResponse> list = permissionRepository.findAllOrderedByGroupAndName().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(list);
    }

    @PostMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ADMIN_PERMISSION_CATALOG_WRITE)
    public ApiResponse<PermissionResponse> create(@RequestBody PermissionCatalogRequest request) {
        validateRequest(request);
        String name = request.getName().trim();
        if (permissionRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        PermissionEntity saved = permissionRepository.save(PermissionEntity.builder()
                .name(name)
                .description(trimToNull(request.getDescription()))
                .groupName(request.getGroupName().trim())
                .build());
        return ApiResponse.success(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ADMIN_PERMISSION_CATALOG_WRITE)
    public ApiResponse<PermissionResponse> update(@PathVariable Long id, @RequestBody PermissionCatalogRequest request) {
        validateRequest(request);
        PermissionEntity permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        String name = request.getName().trim();
        if (permissionRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        permission.setName(name);
        permission.setDescription(trimToNull(request.getDescription()));
        permission.setGroupName(request.getGroupName().trim());
        permissionRepository.save(permission);
        return ApiResponse.success(toResponse(permission));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ADMIN_PERMISSION_CATALOG_WRITE)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        permissionRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    private PermissionResponse toResponse(PermissionEntity p) {
        return PermissionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .groupName(p.getGroupName())
                .build();
    }

    private void validateRequest(PermissionCatalogRequest request) {
        if (request == null || !StringUtils.hasText(request.getName()) || !StringUtils.hasText(request.getGroupName())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
