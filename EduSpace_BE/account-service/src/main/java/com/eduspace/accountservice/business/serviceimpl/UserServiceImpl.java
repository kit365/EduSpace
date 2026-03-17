package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.persistence.repository.UserRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;
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

    @Override
    public UserResponse getProfile(String keycloakId) {
        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getProfileByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
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

        return userMapper.toUserResponse(user);
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

        Specification<UserEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Search Logic
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            // 2. Role Filter (optional: filter by role name)
            if (roles != null && !roles.isEmpty()) {
                List<String> mapped = roles.stream()
                        .filter(r -> r != null && !"Tất cả".equals(r.trim()))
                        .map(r -> mapRole(r.trim()))
                        .distinct()
                        .toList();
                if (!mapped.isEmpty()) {
                    Join<UserEntity, RoleEntity> joinRole = root.join("roles");
                    predicates.add(joinRole.get("name").in(mapped));
                }
            }

            // 3. Hierarchy: exclude users by role (subquery so we exclude the whole user, not just a row)
            if (!isSuperAdmin) {
                // Admin must not see any user that has ADMIN or SUPER_ADMIN
                Subquery<String> subq = query.subquery(String.class);
                Root<UserEntity> subRoot = subq.from(UserEntity.class);
                Join<UserEntity, RoleEntity> subJoin = subRoot.join("roles");
                subq.select(subRoot.get("id"))
                    .where(cb.or(
                        cb.equal(subJoin.get("name"), "ADMIN"),
                        cb.equal(subJoin.get("name"), "SUPER_ADMIN")
                    ));
                predicates.add(cb.not(root.get("id").in(subq)));
            } else {
                // Super admin must not see other super admins (only themselves)
                Subquery<String> subq = query.subquery(String.class);
                Root<UserEntity> subRoot = subq.from(UserEntity.class);
                Join<UserEntity, RoleEntity> subJoin = subRoot.join("roles");
                subq.select(subRoot.get("id"))
                    .where(cb.equal(subJoin.get("name"), "SUPER_ADMIN"));
                predicates.add(cb.or(
                    cb.not(root.get("id").in(subq)),
                    cb.equal(root.get("id"), requester.getId())
                ));
            }

            // 4. Status Filter
            if (status != null && !"Tất cả".equals(status)) {
                predicates.add(cb.equal(root.get("isActive"), "Active".equalsIgnoreCase(status)));
            }

            if (roles != null && !roles.isEmpty()) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserEntity> pageResult = userRepository.findAll(spec, pageable);

        return PageResponse.<UserResponse>builder()
                .content(pageResult.getContent().stream().map(userMapper::toUserResponse).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    private String mapRole(String uiRole) {
        return switch (uiRole) {
            case "Nhân viên" -> "STAFF";
            case "Khách hàng" -> "STUDENT";
            case "Host" -> "TUTOR";
            case "Admin" -> "ADMIN";
            case "Super Admin" -> "SUPER_ADMIN";
            default -> uiRole.toUpperCase();
        };
    }
}
