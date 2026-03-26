package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.HostStaffService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.EmailService;
import com.eduspace.accountservice.common.StaffOperationalAllowlist;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.hoststaff.InviteBranchManagerRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.ReplaceStaffPermissionsRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.UpdateManagerPermissionsRequest;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostStaffMemberResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostManagerScopeResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.InviteBranchManagerResult;
import com.eduspace.accountservice.model.entity.HostStaffLinkEntity;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.entity.UserPermissionEntity;
import com.eduspace.accountservice.persistence.repository.HostStaffLinkRepository;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserPermissionRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import com.eduspace.accountservice.infrastructure.config.AppProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class HostStaffServiceImpl implements HostStaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final HostStaffLinkRepository hostStaffLinkRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final KeycloakUserService keycloakUserService;
    private final EmailService emailService;
    private final RestTemplate restTemplate;
    private final AppProperties appProperties;

    public HostStaffServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            HostStaffLinkRepository hostStaffLinkRepository,
            UserPermissionRepository userPermissionRepository,
            KeycloakUserService keycloakUserService,
            EmailService emailService,
            @Qualifier("loadBalancedRestTemplate") RestTemplate restTemplate,
            AppProperties appProperties) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.hostStaffLinkRepository = hostStaffLinkRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.keycloakUserService = keycloakUserService;
        this.emailService = emailService;
        this.restTemplate = restTemplate;
        this.appProperties = appProperties;
    }

    private static final String TEMP_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final SecureRandom PASSWORD_RANDOM = new SecureRandom();
    private static final String PERMISSION_CSV_SEPARATOR = ",";

    /**
     * Manager permission envelope (per-host template).
     * Must be less than HOST and exclude all admin/rbac/system sensitive scopes.
     */
    private static final Set<String> MANAGER_ALLOWED_PERMISSION_NAMES = Set.of(
            "view_dashboard",
            "branch.branch.view",
            "branch.booking.view",
            "branch.booking.manage",
            "branch.room.view",
            "branch.room.edit",
            "branch.checkin.manage",
            "branch.checkout.manage",
            "branch.room_status.manage",
            "branch.profile.view",
            "view_messages",
            "manage_messages",
            "branch.cleaning.manage",
            "branch.maintenance.manage");

    private static final Set<String> MANAGER_DEFAULT_PERMISSION_NAMES = Set.of(
            "view_dashboard",
            "branch.branch.view",
            "branch.booking.view",
            "branch.booking.manage",
            "branch.room.view",
            "branch.room.edit",
            "branch.checkin.manage",
            "branch.checkout.manage",
            "branch.room_status.manage",
            "branch.profile.view",
            "view_messages",
            "manage_messages");

    private UserEntity resolveHost(String hostUserId) {
        return userRepository.findById(hostUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void assertHostOrManager(UserEntity host) {
        boolean ok = host.getRoles().stream()
                .anyMatch(r -> "HOST".equalsIgnoreCase(r.getName()) || "MANAGER".equalsIgnoreCase(r.getName()));
        if (!ok) {
            throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
        }
    }

    private void assertOwnsStaff(String hostUserId, String staffUserId) {
        HostStaffLinkEntity link = hostStaffLinkRepository.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_STAFF_NOT_FOUND));
        if (!hostUserId.equals(link.getHostUserId())) {
            throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
        }
    }

    private String resolveKeycloakUserId(UserEntity user) {
        if (StringUtils.hasText(user.getKeycloakId())) {
            return user.getKeycloakId().trim();
        }
        try {
            return keycloakUserService.findUserIdByEmail(user.getEmail())
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .orElseThrow(() -> new AppException(ErrorCode.HOST_MANAGER_KEYCLOAK_SYNC_FAILED));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to resolve keycloak id by email for user {} ({})",
                    user.getId(),
                    user.getEmail(),
                    e);
            throw new AppException(ErrorCode.HOST_MANAGER_KEYCLOAK_SYNC_FAILED);
        }
    }

    private void syncGuestToManagerRoleInKeycloak(UserEntity guest, String temporaryPassword) {
        String keycloakUserId = resolveKeycloakUserId(guest);
        if (!keycloakUserId.equals(guest.getKeycloakId())) {
            guest.setKeycloakId(keycloakUserId);
            userRepository.save(guest);
        }
        try {
            if (StringUtils.hasText(temporaryPassword)) {
                keycloakUserService.resetPassword(keycloakUserId, temporaryPassword.trim(), false);
            }
            keycloakUserService.removeRealmRole(keycloakUserId, Role.GUEST.getName());
            keycloakUserService.assignRole(keycloakUserId, Role.MANAGER.getName());
        } catch (Exception e) {
            log.error("Failed to sync Keycloak role GUEST -> MANAGER for user {} ({})",
                    guest.getId(),
                    guest.getEmail(),
                    e);
            throw new AppException(ErrorCode.HOST_MANAGER_KEYCLOAK_SYNC_FAILED);
        }
    }

    private void syncGuestToManagerRoleInKeycloak(UserEntity guest) {
        syncGuestToManagerRoleInKeycloak(guest, null);
    }

    private void assertBranchExistsAndOwnedByHost(Long branchPropertyId, String hostUserId) {
        try {
            String endpoint = appProperties.getGatewayUrl() + "/api/v1/properties/" + branchPropertyId;

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(endpoint, Map.class);
            if (response == null || !(response.get("data") instanceof Map<?, ?> data)) {
                throw new AppException(ErrorCode.HOST_BRANCH_NOT_FOUND);
            }
            Object ownerId = data.get("ownerId");
            if (!(ownerId instanceof String owner) || !hostUserId.equals(owner.trim())) {
                throw new AppException(ErrorCode.HOST_BRANCH_FORBIDDEN);
            }
        } catch (HttpClientErrorException.NotFound e) {
            throw new AppException(ErrorCode.HOST_BRANCH_NOT_FOUND);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to validate branch {} ownership for host {}", branchPropertyId, hostUserId, e);
            throw new AppException(ErrorCode.HOST_BRANCH_VALIDATION_FAILED);
        }
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            int idx = PASSWORD_RANDOM.nextInt(TEMP_PASSWORD_CHARS.length());
            sb.append(TEMP_PASSWORD_CHARS.charAt(idx));
        }
        return sb.toString();
    }

    private String buildDisplayNameFromEmail(String email) {
        String localPart = email.split("@")[0].trim();
        if (localPart.isBlank()) {
            return "Manager";
        }
        return localPart;
    }

    private static String normalizePermissionName(String name) {
        if (name == null) return "";
        return name.trim().toLowerCase();
    }

    private static Set<String> parsePermissionCsv(String csv) {
        if (!StringUtils.hasText(csv)) return new LinkedHashSet<>();
        return Arrays.stream(csv.split(PERMISSION_CSV_SEPARATOR))
                .map(HostStaffServiceImpl::normalizePermissionName)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static String toPermissionCsv(Set<String> names) {
        if (names == null || names.isEmpty()) return null;
        return names.stream()
                .filter(Objects::nonNull)
                .map(HostStaffServiceImpl::normalizePermissionName)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(PERMISSION_CSV_SEPARATOR));
    }

    private Set<String> managerDefaults() {
        return new LinkedHashSet<>(MANAGER_DEFAULT_PERMISSION_NAMES);
    }

    private Set<String> resolveManagerPermissionNames(HostStaffLinkEntity link) {
        Set<String> names = parsePermissionCsv(link != null ? link.getManagerPermissionNames() : null);
        if (!names.isEmpty()) {
            return names.stream()
                    .filter(MANAGER_ALLOWED_PERMISSION_NAMES::contains)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        return managerDefaults();
    }

    private void ensureManagerPermissionDefaults(HostStaffLinkEntity link) {
        if (link == null) return;
        Set<String> existing = parsePermissionCsv(link.getManagerPermissionNames());
        if (!existing.isEmpty()) return;
        link.setManagerPermissionNames(toPermissionCsv(managerDefaults()));
    }

    private Set<String> resolveManagerPermissionNamesByIds(List<Long> permissionIds) {
        List<Long> ids = permissionIds == null ? Collections.emptyList() : permissionIds;
        if (ids.isEmpty()) return new LinkedHashSet<>();
        List<PermissionEntity> perms = permissionRepository.findAllById(ids);
        if (perms.size() != ids.size()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Set<String> names = perms.stream()
                .map(PermissionEntity::getName)
                .map(HostStaffServiceImpl::normalizePermissionName)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        for (String n : names) {
            if (!MANAGER_ALLOWED_PERMISSION_NAMES.contains(n)) {
                throw new AppException(ErrorCode.INVALID_MANAGER_PERMISSION);
            }
        }
        return names;
    }

    private HostStaffMemberResponse toResponse(UserEntity staff, HostStaffLinkEntity link) {
        Set<String> permissionNames = new LinkedHashSet<>();

        boolean hasManagerRole = staff.getRoles() != null
                && staff.getRoles().stream().anyMatch(r -> "MANAGER".equalsIgnoreCase(r.getName()));

        if (hasManagerRole) {
            permissionNames.addAll(resolveManagerPermissionNames(link));
        }

        // STAFF and direct grants remain supported via user_permissions.
        permissionNames.addAll(userPermissionRepository.findPermissionNamesByUserId(staff.getId()));

        String memberRole = staff.getRoles().stream()
                .map(RoleEntity::getName)
                .filter(n -> "STAFF".equalsIgnoreCase(n) || "MANAGER".equalsIgnoreCase(n))
                .findFirst()
                .orElse("MANAGER");
        return HostStaffMemberResponse.builder()
                .id(staff.getId())
                .email(staff.getEmail())
                .fullName(staff.getFullName())
                .phoneNumber(staff.getPhoneNumber())
                .isActive(staff.getIsActive())
                .memberRole(memberRole)
                .branchPropertyId(link != null ? link.getBranchPropertyId() : null)
                .permissionNames(permissionNames)
                .createdAt(staff.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HostStaffMemberResponse> listStaff(String hostUserId) {
        UserEntity host = resolveHost(hostUserId);
        assertHostOrManager(host);
        List<HostStaffMemberResponse> out = new ArrayList<>();
        for (HostStaffLinkEntity link : hostStaffLinkRepository.findAllByHostUserIdOrderByCreatedAtAsc(host.getId())) {
            userRepository.findById(link.getStaffUserId()).ifPresent(s -> out.add(toResponse(s, link)));
        }
        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public HostManagerScopeResponse getManagerScope(String currentUserId) {
        UserEntity user = resolveHost(currentUserId);
        boolean isManager = user.getRoles() != null
                && user.getRoles().stream().anyMatch(r -> "MANAGER".equalsIgnoreCase(r.getName()));
        if (!isManager) {
            return HostManagerScopeResponse.builder()
                    .managerScoped(false)
                    .branchPropertyId(null)
                    .build();
        }
        Long branchPropertyId = hostStaffLinkRepository.findByStaffUserId(currentUserId)
                .map(HostStaffLinkEntity::getBranchPropertyId)
                .orElse(null);
        return HostManagerScopeResponse.builder()
                .managerScoped(true)
                .branchPropertyId(branchPropertyId)
                .build();
    }

    @Override
    @Transactional
    public InviteBranchManagerResult inviteBranchManager(String hostUserId, InviteBranchManagerRequest request) {
        try {
            UserEntity host = resolveHost(hostUserId);
            assertHostOrManager(host);

            String email = request.getEmail().trim();
            Long branchPropertyId = request.getBranchPropertyId();
            if (branchPropertyId == null) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            assertBranchExistsAndOwnedByHost(branchPropertyId, host.getId());

            RoleEntity managerRole = roleRepository.findByName(Role.MANAGER.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            UserEntity user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                if (user.getId().equals(host.getId())) {
                    throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
                }
                HostStaffLinkEntity existing = hostStaffLinkRepository.findByStaffUserId(user.getId()).orElse(null);
                if (existing != null && host.getId().equals(existing.getHostUserId())
                        && branchPropertyId.equals(existing.getBranchPropertyId())) {
                    throw new AppException(ErrorCode.HOST_MANAGER_ALREADY_LINKED);
                }
                if (existing != null && !host.getId().equals(existing.getHostUserId())) {
                    throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
                }

                user.setRoles(new LinkedHashSet<>(List.of(managerRole)));
                if (StringUtils.hasText(request.getFullName())) {
                    user.setFullName(request.getFullName().trim());
                }
                userRepository.save(user);
                userPermissionRepository.deleteAllByUserId(user.getId());
                syncGuestToManagerRoleInKeycloak(user, request.getTemporaryPassword());

                HostStaffLinkEntity link = existing != null ? existing : HostStaffLinkEntity.builder()
                        .hostUserId(host.getId())
                        .staffUserId(user.getId())
                        .build();
                link.setHostUserId(host.getId());
                link.setStaffUserId(user.getId());
                link.setBranchPropertyId(branchPropertyId);
                ensureManagerPermissionDefaults(link);
                hostStaffLinkRepository.save(link);
                emailService.sendManagerAssignedEmail(user.getEmail(), user.getFullName(), branchPropertyId);

                log.info("Host {} granted manager role to existing user {} for branch {}",
                        host.getId(), user.getId(), branchPropertyId);
                return InviteBranchManagerResult.builder()
                        .member(toResponse(user, link))
                        .created(false)
                        .build();
            }

            String fullName = StringUtils.hasText(request.getFullName())
                    ? request.getFullName().trim()
                    : buildDisplayNameFromEmail(email);
            String tempPassword = StringUtils.hasText(request.getTemporaryPassword())
                    ? request.getTemporaryPassword().trim()
                    : generateTemporaryPassword();
            String keycloakId = keycloakUserService.createUser(email, fullName, tempPassword);
            keycloakUserService.removeRealmRole(keycloakId, Role.GUEST.getName());
            keycloakUserService.assignRole(keycloakId, Role.MANAGER.getName());
            try {
                keycloakUserService.verifyEmail(keycloakId);
            } catch (Exception e) {
                log.warn("Could not auto-verify invited manager email {}", email, e);
            }

            UserEntity created = UserEntity.builder()
                    .keycloakId(keycloakId)
                    .email(email)
                    .fullName(fullName)
                    .roles(new LinkedHashSet<>(List.of(managerRole)))
                    .isEmailVerified(true)
                    .isActive(true)
                    .build();
            userRepository.save(created);
            HostStaffLinkEntity link = hostStaffLinkRepository.save(HostStaffLinkEntity.builder()
                    .hostUserId(host.getId())
                    .staffUserId(created.getId())
                    .branchPropertyId(branchPropertyId)
                    .managerPermissionNames(toPermissionCsv(managerDefaults()))
                    .build());
            emailService.sendManagerInviteEmail(created.getEmail(), created.getFullName(), branchPropertyId, tempPassword);
            log.info("Host {} created invited manager {} for branch {}", host.getId(), created.getId(), branchPropertyId);
            return InviteBranchManagerResult.builder()
                    .member(toResponse(created, link))
                    .created(true)
                    .build();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while inviting branch manager. hostUserId={}, email={}, branchPropertyId={}",
                    hostUserId,
                    request != null ? request.getEmail() : null,
                    request != null ? request.getBranchPropertyId() : null,
                    e);
            throw new AppException(ErrorCode.HOST_MANAGER_INVITE_FAILED);
        }
    }

    @Override
    @Transactional
    public HostStaffMemberResponse updateManagerPermissions(
            String hostUserId,
            String staffUserId,
            UpdateManagerPermissionsRequest request) {
        UserEntity host = resolveHost(hostUserId);
        assertHostOrManager(host);
        assertOwnsStaff(host.getId(), staffUserId);

        UserEntity manager = userRepository.findById(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_STAFF_NOT_FOUND));
        boolean isManager = manager.getRoles().stream().anyMatch(r -> "MANAGER".equalsIgnoreCase(r.getName()));
        if (!isManager) {
            throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
        }

        HostStaffLinkEntity link = hostStaffLinkRepository.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_STAFF_NOT_FOUND));
        Set<String> names = resolveManagerPermissionNamesByIds(request != null ? request.getPermissionIds() : null);
        link.setManagerPermissionNames(toPermissionCsv(names));
        hostStaffLinkRepository.save(link);
        return toResponse(manager, link);
    }

    @Override
    @Transactional
    public HostStaffMemberResponse replacePermissions(
            String hostUserId, String staffUserId, ReplaceStaffPermissionsRequest request) {
        UserEntity host = resolveHost(hostUserId);
        assertHostOrManager(host);
        assertOwnsStaff(host.getId(), staffUserId);

        UserEntity staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_STAFF_NOT_FOUND));

        boolean isStaff = staff.getRoles().stream().anyMatch(r -> "STAFF".equalsIgnoreCase(r.getName()));
        if (!isStaff) {
            throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
        }

        Set<String> names = request.getPermissionNames() != null ? request.getPermissionNames() : Set.of();
        for (String n : names) {
            if (n == null || n.isBlank() || !StaffOperationalAllowlist.isAllowed(n.trim())) {
                throw new AppException(ErrorCode.INVALID_STAFF_PERMISSION);
            }
        }

        userPermissionRepository.deleteAllByUserId(staffUserId);
        if (!names.isEmpty()) {
            Set<String> trimmed = new LinkedHashSet<>();
            names.forEach(n -> trimmed.add(n.trim()));
            List<PermissionEntity> perms = permissionRepository.findByNameIn(trimmed);
            if (perms.size() != trimmed.size()) {
                throw new AppException(ErrorCode.INVALID_STAFF_PERMISSION);
            }
            for (PermissionEntity p : perms) {
                userPermissionRepository.save(UserPermissionEntity.builder()
                        .user(staff)
                        .permission(p)
                        .build());
            }
        }

        return toResponse(staff, hostStaffLinkRepository.findByStaffUserId(staffUserId).orElse(null));
    }

    @Override
    @Transactional
    public void removeStaff(String hostUserId, String staffUserId) {
        UserEntity host = resolveHost(hostUserId);
        assertHostOrManager(host);
        assertOwnsStaff(host.getId(), staffUserId);

        UserEntity staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_STAFF_NOT_FOUND));

        hostStaffLinkRepository.findByStaffUserId(staffUserId).ifPresent(hostStaffLinkRepository::delete);
        userPermissionRepository.deleteAllByUserId(staffUserId);

        RoleEntity guestRole = roleRepository.findByName(Role.GUEST.getName())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        staff.setRoles(new LinkedHashSet<>(List.of(guestRole)));
        keycloakUserService.removeRealmRole(staff.getKeycloakId(), Role.MANAGER.getName());
        keycloakUserService.removeRealmRole(staff.getKeycloakId(), Role.STAFF.getName());
        keycloakUserService.assignRole(staff.getKeycloakId(), Role.GUEST.getName());
        staff.setIsActive(true);
        userRepository.save(staff);
        log.info("Host {} removed staff/manager {} — reverted to GUEST", host.getId(), staffUserId);
    }
}
