package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.HostStaffService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.StaffOperationalAllowlist;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.hoststaff.InviteBranchManagerRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.ReplaceStaffPermissionsRequest;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostStaffMemberResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class HostStaffServiceImpl implements HostStaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final HostStaffLinkRepository hostStaffLinkRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final KeycloakUserService keycloakUserService;

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

    private HostStaffMemberResponse toResponse(UserEntity staff, HostStaffLinkEntity link) {
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
                .permissionNames(new LinkedHashSet<>(userPermissionRepository.findPermissionNamesByUserId(staff.getId())))
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
    @Transactional
    public HostStaffMemberResponse inviteBranchManager(String hostUserId, InviteBranchManagerRequest request) {
        UserEntity host = resolveHost(hostUserId);
        assertHostOrManager(host);

        String email = request.getEmail().trim();
        Long branchPropertyId = request.getBranchPropertyId();
        if (branchPropertyId == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        UserEntity guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (guest.getId().equals(host.getId())) {
            throw new AppException(ErrorCode.HOST_STAFF_FORBIDDEN);
        }

        if (hostStaffLinkRepository.existsByStaffUserId(guest.getId())) {
            throw new AppException(ErrorCode.HOST_MANAGER_ALREADY_LINKED);
        }

        boolean onlyGuest = guest.getRoles() != null
                && guest.getRoles().size() == 1
                && guest.getRoles().stream().anyMatch(r -> "GUEST".equalsIgnoreCase(r.getName()));
        if (!onlyGuest) {
            throw new AppException(ErrorCode.HOST_MANAGER_INVALID_USER);
        }

        RoleEntity managerRole = roleRepository.findByName(Role.MANAGER.getName())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        guest.setRoles(Set.of(managerRole));
        userRepository.save(guest);

        userPermissionRepository.deleteAllByUserId(guest.getId());

        keycloakUserService.removeRealmRole(guest.getKeycloakId(), Role.GUEST.getName());
        keycloakUserService.assignRole(guest.getKeycloakId(), Role.MANAGER.getName());

        hostStaffLinkRepository.save(HostStaffLinkEntity.builder()
                .hostUserId(host.getId())
                .staffUserId(guest.getId())
                .branchPropertyId(branchPropertyId)
                .build());

        log.info("Host {} invited branch manager {} for property {}", host.getId(), guest.getId(), branchPropertyId);
        return toResponse(guest, hostStaffLinkRepository.findByStaffUserId(guest.getId()).orElse(null));
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

        staff.setRoles(Set.of(guestRole));
        keycloakUserService.removeRealmRole(staff.getKeycloakId(), Role.MANAGER.getName());
        keycloakUserService.removeRealmRole(staff.getKeycloakId(), Role.STAFF.getName());
        keycloakUserService.assignRole(staff.getKeycloakId(), Role.GUEST.getName());
        staff.setIsActive(true);
        userRepository.save(staff);
        log.info("Host {} removed staff/manager {} — reverted to GUEST", host.getId(), staffUserId);
    }
}
