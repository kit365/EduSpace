package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.HostStaffLinkEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.SupportStaffPresenceService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.persistence.repository.UserPermissionRepository;
import com.eduspace.accountservice.persistence.repository.HostStaffLinkRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.Optional;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final KeycloakUserService keycloakUserService;
    private final SupportStaffPresenceService supportStaffPresenceService;
    private final UserPermissionRepository userPermissionRepository;
    private final HostStaffLinkRepository hostStaffLinkRepository;

    private static final Set<String> MANAGER_DEFAULT_PERMISSION_NAMES = Set.of(
            "view_dashboard",
            "branch.branch.view",
            "branch.booking.view",
            "branch.booking.manage",
            "branch.room.view",
            "branch.checkin.manage",
            "branch.checkout.manage",
            "branch.room_status.manage",
            "branch.profile.view",
            "branch.finance.view",
            "branch.finance.export",
            "view_messages",
            "manage_messages",
            "branch.utility.view",
            "branch.utility.create",
            "branch.utility.edit",
            "branch.utility.delete",
            "branch.deposit_policy.view",
            "branch.deposit_policy.create",
            "branch.deposit_policy.edit",
            "branch.deposit_policy.delete",
            "rbac.permission.view",
            "rbac.template.view");

    private UserResponse toUserResponseWithMergedPermissions(UserEntity user) {
        UserResponse response = userMapper.toUserResponse(user, userPermissionRepository.findPermissionNamesByUserId(user.getId()));
        boolean isManager = user.getRoles() != null
                && user.getRoles().stream().anyMatch(r -> "MANAGER".equalsIgnoreCase(r.getName()));
        boolean isHost = user.getRoles() != null
                && user.getRoles().stream().anyMatch(r -> "HOST".equalsIgnoreCase(r.getName()));
        // Strict host RBAC: if user has HOST role, permissions exposed to Host UI must come from HOST role only.
        // This prevents MANAGER role grants from leaking host menu items when HOST role has no assigned permissions.
        if (isHost) {
            response.setPermissions(resolvePermissionsByRole(user, "HOST"));
            return response;
        }
        // Only enforce per-host manager defaults for manager-only users.
        // If a user also has HOST role, host role permissions should remain the source of truth.
        if (!isManager) return response;
        HostStaffLinkEntity link = hostStaffLinkRepository.findByStaffUserId(user.getId()).orElse(null);
        Set<String> linkPermissions = parsePermissionCsv(link != null ? link.getManagerPermissionNames() : null);
        if (linkPermissions.isEmpty()) {
            linkPermissions = new LinkedHashSet<>(MANAGER_DEFAULT_PERMISSION_NAMES);
        }
        response.setPermissions(linkPermissions);
        return response;
    }

    private static Set<String> parsePermissionCsv(String csv) {
        if (csv == null || csv.trim().isEmpty()) return new LinkedHashSet<>();
        return Arrays.stream(csv.split(","))
                .map(s -> s == null ? "" : s.trim().toLowerCase())
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static Set<String> resolvePermissionsByRole(UserEntity user, String roleName) {
        if (user == null || user.getRoles() == null || roleName == null) {
            return Collections.emptySet();
        }
        return user.getRoles().stream()
                .filter(r -> r != null && roleName.equalsIgnoreCase(r.getName()))
                .flatMap(r -> r.getPermissions() == null ? java.util.stream.Stream.empty() : r.getPermissions().stream())
                .map(p -> p == null ? null : p.getName())
                .filter(name -> name != null && !name.isBlank())
                .map(name -> name.trim().toLowerCase())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public UserResponse getProfile(String keycloakId) {
        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toUserResponseWithMergedPermissions(user);
    }

    @Override
    public UserResponse getProfileByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toUserResponseWithMergedPermissions(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String keycloakId, String email, UpdateProfileRequest request) {
        UserEntity user;
        if (keycloakId != null) {
            user = userRepository.findByKeycloakId(keycloakId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            // Ensure we use the right ID
            keycloakId = user.getKeycloakId();
        }

        userMapper.updateUserEntityFromRequest(request, user);

        userRepository.save(user);
        log.info("Profile updated for user: {}", keycloakId);

        return toUserResponseWithMergedPermissions(user);
    }

    @Override
    public void changePassword(String keycloakId, String email, String oldPassword, String newPassword) {
        if (keycloakId == null) {
            UserEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            keycloakId = user.getKeycloakId();
        }
        keycloakUserService.changePassword(keycloakId, email, oldPassword, newPassword);
    }

    @Override
    @Transactional
    public TwoFactorResponse generate2faSecret(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        SecretGenerator generator = new DefaultSecretGenerator();
        String secret = generator.generate();

        // Save secret temporarily to the user
        user.setTotpSecret(secret);
        userRepository.save(user);

        QrData data = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("EduSpace")
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        return TwoFactorResponse.builder()
                .secret(secret)
                .qrCodeUrl(data.getUri())
                .build();
    }

    @Override
    @Transactional
    public void enable2fa(String email, String code) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getTotpSecret() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        if (!verifier.isValidCode(user.getTotpSecret(), code)) {
            throw new AppException(ErrorCode.INVALID_2FA_CODE);
        }

        user.setIs2faEnabled(true);
        userRepository.save(user);
        log.info("2FA enabled successfully for user: {}", email);
    }

    @Override
    @Transactional
    public void disable2fa(String email, String code) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!Boolean.TRUE.equals(user.getIs2faEnabled())) {
            return; // Already disabled
        }

        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        if (!verifier.isValidCode(user.getTotpSecret(), code)) {
            throw new AppException(ErrorCode.INVALID_2FA_CODE);
        }

        user.setIs2faEnabled(false);
        user.setTotpSecret(null);
        userRepository.save(user);
        log.info("2FA disabled successfully for user: {}", email);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfileByUserId(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toPublicUserProfile(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicUserProfileResponse> getPublicProfilesByUserIds(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllById(userIds).stream()
                .map(userMapper::toPublicUserProfile)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfileByKeycloakId(String keycloakId) {
        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toPublicUserProfile(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfileByIdentifier(String identifier) {
        if (identifier == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        // Simple heuristic: if it contains '@', it's likely an email
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier)
                    .map(userMapper::toPublicUserProfile)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
        
        // Otherwise assume it's a Keycloak ID (UUID)
        return userRepository.findByKeycloakId(identifier)
                .map(userMapper::toPublicUserProfile)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicUserProfileResponse> getPublicProfilesByKeycloakIds(List<String> keycloakIds) {
        if (keycloakIds == null || keycloakIds.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllByKeycloakIdIn(keycloakIds).stream()
                .map(userMapper::toPublicUserProfile)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicUserProfileResponse> getPublicProfilesByIdentifiers(List<String> identifiers) {
        if (identifiers == null || identifiers.isEmpty()) {
            return List.of();
        }

        List<String> emails = identifiers.stream()
                .filter(id -> id != null && id.contains("@"))
                .toList();
        List<String> keycloakIds = identifiers.stream()
                .filter(id -> id != null && !id.contains("@"))
                .toList();

        List<UserEntity> users = new java.util.ArrayList<>();
        if (!emails.isEmpty()) {
            users.addAll(userRepository.findAllByEmailIn(emails));
        }
        if (!keycloakIds.isEmpty()) {
            users.addAll(userRepository.findAllByKeycloakIdIn(keycloakIds));
        }

        return users.stream()
                .distinct()
                .map(userMapper::toPublicUserProfile)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicUserProfileResponse> searchPublicProfiles(String query, int limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return userRepository.searchByEmailOrFullName(query).stream()
                .limit(safeLimit)
                .map(userMapper::toPublicUserProfile)
                .toList();
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable, String search, List<String> roles, String status, String kyc, String identifier, boolean isEmail) {
        UserEntity requester;
        if (isEmail) {
            requester = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else {
            requester = userRepository.findByKeycloakId(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        boolean isSuperAdmin = requester.getRoles().stream().anyMatch(r -> "SUPER_ADMIN".equals(r.getName()));

        List<String> mappedRoles = (roles != null && !roles.isEmpty())
                ? roles.stream()
                        .filter(r -> r != null && !"Tất cả".equals(r.trim()))
                        .map(this::mapRole)
                        .distinct()
                        .toList()
                : null;

        Specification<UserEntity> spec = com.eduspace.accountservice.persistence.specification.UserSpecification.hasFilters(
                search, mappedRoles, status, isSuperAdmin, requester
        );

        Page<UserEntity> pageResult = userRepository.findAll(spec, pageable);

        return PageResponse.<UserResponse>builder()
                .content(pageResult.getContent().stream().map(this::toUserResponseWithMergedPermissions).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countEligibleSupportStaff() {
        return userRepository.countDistinctActiveUsersWithSupportRoles();
    }

    @Override
    public String assignStaff(String customerId) {
        log.info("Assigning staff for customerId: {}", customerId);
        
        // Try to find a user with role ADMIN (or STAFF if you prefer)
        List<UserEntity> admins = userRepository.findByRoleName("ADMIN");
        
        if (admins.isEmpty()) {
            // Fallback to SUPER_ADMIN if no ADMIN found
            admins = userRepository.findByRoleName("SUPER_ADMIN");
        }

        if (admins.isEmpty()) {
            log.warn("No users with ADMIN or SUPER_ADMIN role found. Attempting developer fallback...");
            admins = userRepository.findAll().stream()
                    .filter(u -> u.getEmail() != null && 
                                (u.getEmail().contains("admin") || u.getEmail().contains("kietops")))
                    .toList();
            
            if (admins.isEmpty()) {
                // Absolute last resort: just pick the first user available except the customer
                admins = userRepository.findAll().stream()
                        .filter(u -> !u.getKeycloakId().equals(customerId))
                        .toList();
            }

            if (admins.isEmpty()) {
                log.error("Absolutely no staff available to assign for customer: {}", customerId);
                return null;
            }
        }

        Set<String> online = supportStaffPresenceService.getOnlineMemberIds();
        Optional<UserEntity> onlineFirst = admins.stream()
                .filter(a -> a.getKeycloakId() != null && online.contains(a.getKeycloakId()))
                .findFirst();
        if (onlineFirst.isPresent()) {
            UserEntity assigned = onlineFirst.get();
            log.info("Assigned online admin {} to customer {}", assigned.getEmail(), customerId);
            return assigned.getKeycloakId();
        }

        UserEntity assigned = admins.get(0);
        log.info("Assigned admin (pool order, none online in Redis) {} to customer {}", assigned.getEmail(), customerId);
        return assigned.getKeycloakId();
    }

    private String mapRole(String uiRole) {
        return switch (uiRole) {
            case "Quản lý", "Nhân viên" -> "MANAGER";
            case "Khách hàng" -> "GUEST";
            case "Host" -> "HOST";
            case "Admin" -> "ADMIN";
            case "Super Admin" -> "SUPER_ADMIN";
            default -> uiRole.toUpperCase();
        };
    }

    @Override
    @Transactional
    public void approveUserKyc(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setVerificationStatus("VERIFIED");
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void rejectUserKyc(String userId, String reason) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setVerificationStatus("REJECTED");
        userRepository.save(user);
    }
}
