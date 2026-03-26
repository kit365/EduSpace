package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.RolePermissionService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.permission.UpdateRolePermissionsRequest;
import com.eduspace.accountservice.model.dto.response.role.PermissionResponse;
import com.eduspace.accountservice.model.dto.response.role.RoleResponse;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.model.entity.PermissionTemplateEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.persistence.repository.PermissionTemplateRepository;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {

    private static final String SUPER_ADMIN = "SUPER_ADMIN";
    private static final String MANAGER = "MANAGER";
    private static final Set<String> MANAGER_FORBIDDEN_EXACT = Set.of(
            "branch.finance.manage",
            "rbac.permission.manage",
            "rbac.template.manage",
            "rbac.role.assign"
    );
    private static final List<String> MANAGER_FORBIDDEN_PREFIXES = List.of("admin.");

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PermissionTemplateRepository permissionTemplateRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RoleResponse replaceRolePermissions(Long roleId, UpdateRolePermissionsRequest request) {
        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        assertRoleEditable(role);
        List<Long> ids = request != null && request.getPermissionIds() != null
                ? request.getPermissionIds()
                : List.of();
        Set<PermissionEntity> next = ids.isEmpty()
                ? Collections.emptySet()
                : new HashSet<>(permissionRepository.findAllById(ids));
        if (!ids.isEmpty() && next.size() != ids.size()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        role.getPermissions().clear();
        role.getPermissions().addAll(next);
        assertManagerPermissionPolicy(role, role.getPermissions());
        roleRepository.save(role);
        return toRoleResponse(roleRepository.findById(roleId).orElse(role));
    }

    @Override
    @Transactional
    public RoleResponse applyTemplate(Long roleId, Long templateId, boolean replace) {
        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        assertRoleEditable(role);
        PermissionTemplateEntity template = permissionTemplateRepository.findByIdWithPermissions(templateId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (replace) {
            role.getPermissions().clear();
        }
        role.getPermissions().addAll(template.getPermissions());
        assertManagerPermissionPolicy(role, role.getPermissions());
        roleRepository.save(role);
        return toRoleResponse(roleRepository.findById(roleId).orElse(role));
    }

    private void assertRoleEditable(RoleEntity role) {
        if (SUPER_ADMIN.equalsIgnoreCase(Optional.ofNullable(role.getName()).orElse(""))) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private void assertManagerPermissionPolicy(RoleEntity role, Set<PermissionEntity> permissions) {
        if (!MANAGER.equalsIgnoreCase(Optional.ofNullable(role.getName()).orElse(""))) {
            return;
        }
        boolean violatesPolicy = permissions.stream()
                .map(PermissionEntity::getName)
                .filter(name -> name != null && !name.isBlank())
                .map(String::trim)
                .anyMatch(name -> MANAGER_FORBIDDEN_EXACT.contains(name)
                        || managerForbiddenPrefixMatch(name));
        if (violatesPolicy) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private boolean managerForbiddenPrefixMatch(String permissionName) {
        return MANAGER_FORBIDDEN_PREFIXES.stream().anyMatch(permissionName::startsWith);
    }

    private RoleResponse toRoleResponse(RoleEntity role) {
        int userCount = (int) userRepository.countUsersByRoleId(role.getId());
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .userCount(userCount)
                .permissions(Optional.ofNullable(role.getPermissions()).orElse(Collections.emptySet()).stream()
                        .map(p -> PermissionResponse.builder()
                                .id(p.getId())
                                .name(p.getName())
                                .description(p.getDescription())
                                .groupName(p.getGroupName())
                                .build())
                        .collect(Collectors.toSet()))
                .build();
    }
}
