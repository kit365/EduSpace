package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.role.RoleResponse;
import com.eduspace.accountservice.model.dto.response.role.PermissionResponse;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.ADMIN + "/roles")
@RequiredArgsConstructor
public class RoleController {

    private static final List<String> ROLE_LIST_ORDER = List.of("ADMIN", "HOST", "MANAGER", "GUEST");

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        List<RoleEntity> roles = roleRepository.findAll();

        // No one sees SUPER_ADMIN role (neither ADMIN nor other SUPER_ADMIN)
        List<RoleResponse> response = roles.stream()
                .filter(r -> !"SUPER_ADMIN".equals(r.getName()))
                .sorted(Comparator
                        .comparingInt((RoleEntity r) -> {
                            int i = ROLE_LIST_ORDER.indexOf(r.getName());
                            return i >= 0 ? i : Integer.MAX_VALUE;
                        })
                        .thenComparing(RoleEntity::getName))
                .map(role -> RoleResponse.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .permissions(Optional.ofNullable(role.getPermissions()).orElse(Collections.emptySet()).stream()
                                .map(p -> PermissionResponse.builder()
                                        .id(p.getId())
                                        .name(p.getName())
                                        .description(p.getDescription())
                                        .groupName(p.getGroupName())
                                        .build())
                                .collect(Collectors.toSet()))
                        .userCount((int) userRepository.countUsersByRoleId(role.getId()))
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success(response);
    }
}
