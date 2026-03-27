package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.AuthService;
import com.eduspace.accountservice.business.service.ActivityLogService;
import com.eduspace.accountservice.business.service.EmailService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.ActivityLogEventType;
import com.eduspace.accountservice.common.enums.ActivityLogStatus;
import com.eduspace.accountservice.common.enums.PartnerAppStatus;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.auth.LoginRequest;
import com.eduspace.accountservice.model.dto.request.auth.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.HostPartnerApplicationEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.persistence.repository.HostPartnerApplicationRepository;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.springframework.util.StringUtils;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final KeycloakUserService keycloakUserService;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;
    private final HostPartnerApplicationRepository hostPartnerApplicationRepository;
    private final ActivityLogService activityLogService;

    private static final String REDIS_KEY_PREFIX = "email_verify:";

    @Value("${app.verification.token-expiry-hours}")
    private int tokenExpiryHours;

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        UserEntity user = null;
        try {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            recoverHostRoleIfApproved(user);

            if (Boolean.FALSE.equals(user.getIsEmailVerified())) {
                throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
            }

            if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
                if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                    throw new AppException(ErrorCode.REQUIRE_2FA);
                }
                if (user.getTotpSecret() == null) {
                    throw new AppException(ErrorCode.REQUIRE_2FA);
                }
                // Verify TOTP using the secret
                dev.samstevens.totp.code.CodeVerifier verifier = new dev.samstevens.totp.code.DefaultCodeVerifier(
                        new dev.samstevens.totp.code.DefaultCodeGenerator(),
                        new dev.samstevens.totp.time.SystemTimeProvider());
                if (!verifier.isValidCode(user.getTotpSecret(), request.getOtp().trim())) {
                    throw new AppException(ErrorCode.INVALID_2FA_CODE);
                }
            }
            LoginResponse response = keycloakUserService.authenticate(email, request.getPassword(), null);
            activityLogService.log(ActivityLogEventType.LOGIN, ActivityLogStatus.SUCCESS, user.getId(), user.getEmail(),
                    "User login successful", null);
            return response;
        } catch (RuntimeException ex) {
            activityLogService.log(ActivityLogEventType.LOGIN, ActivityLogStatus.FAILURE,
                    user != null ? user.getId() : null,
                    user != null ? user.getEmail() : email,
                    "User login failed: " + ex.getClass().getSimpleName(),
                    null);
            throw ex;
        }
    }

    /**
     * Self-heal legacy inconsistency: approved host application but account still missing HOST role.
     */
    private void recoverHostRoleIfApproved(UserEntity user) {
        if (user == null) {
            return;
        }
        boolean hasHost = user.getRoles().stream()
                .anyMatch(r -> Role.HOST.getName().equalsIgnoreCase(r.getName()));
        if (hasHost) {
            return;
        }

        var approved = hostPartnerApplicationRepository.findByUserIdAndStatus(user.getId(), PartnerAppStatus.APPROVED);
        if (approved.isEmpty()) {
            return;
        }

        String applicantType = approved.get().getApplicantType();
        if ("BRANCH".equalsIgnoreCase(StringUtils.trimWhitespace(applicantType))) {
            return;
        }

        RoleEntity hostRole = roleRepository.findByName(Role.HOST.getName())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        user.getRoles().add(hostRole);
        user.setVerificationStatus("VERIFIED");
        userRepository.save(user);

        try {
            keycloakUserService.assignRole(user.getKeycloakId(), Role.HOST.getName());
        } catch (NotFoundException ex) {
            String resolvedKeycloakId = keycloakUserService.findUserIdByEmail(user.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            if (!resolvedKeycloakId.equals(user.getKeycloakId())) {
                user.setKeycloakId(resolvedKeycloakId);
                userRepository.save(user);
            }
            keycloakUserService.assignRole(resolvedKeycloakId, Role.HOST.getName());
        } catch (Exception ex) {
            log.warn("HOST role recovery failed for {}: {}", user.getEmail(), ex.getMessage());
        }
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        UserEntity user = null;
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        try {
            if (userRepository.existsByEmail(email)) {
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
            }

            String keycloakId = keycloakUserService.createUser(
                    email, request.getFullName(), request.getPassword());

            RoleEntity guestRole = roleRepository.findByName(Role.GUEST.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

            user = UserEntity.builder()
                    .keycloakId(keycloakId)
                    .email(email)
                    .fullName(request.getFullName())
                    .roles(Set.of(guestRole))
                    .build();

            // If user registers as Host, map host fields into UserEntity first.
            // Then save user to generate id, and finally create HostPartnerApplicationEntity.
            String at = null;
            String addr = null;
            String phone = null;
            String documentFrontUrl = null;
            String documentBackUrl = null;
            String businessLicenseUrl = null;

            if (request.getHostPartnerApplication() != null) {
                var hp = request.getHostPartnerApplication();
                at = hp.getApplicantType() != null ? hp.getApplicantType().trim() : "";
                addr = hp.getAddress() != null ? hp.getAddress().trim() : "";
                if (at.isEmpty() || addr.isEmpty()) {
                    throw new AppException(ErrorCode.INVALID_KEY);
                }

                phone = hp.getPhone() != null ? hp.getPhone().trim() : null;
                documentFrontUrl = trimNull(hp.getDocumentFrontUrl());
                documentBackUrl = trimNull(hp.getDocumentBackUrl());
                businessLicenseUrl = trimNull(hp.getBusinessLicenseUrl());

                user.setHostType(at);
                user.setPhoneNumber(phone);
                user.setStreetAddress(addr);
            }

            userRepository.save(user);
            log.info("User registered: {} (keycloakId: {})", email, keycloakId);

            if (at != null) {
                String msg = "Đăng ký host qua form tạo tài khoản.";
                HostPartnerApplicationEntity app = HostPartnerApplicationEntity.builder()
                        .userId(user.getId())
                        .applicantType(at)
                        .fullName(request.getFullName().trim())
                        .phone(phone)
                        .email(email)
                        .address(addr)
                        .message(msg)
                        .documentFrontUrl(documentFrontUrl)
                        .documentBackUrl(documentBackUrl)
                        .businessLicenseUrl(businessLicenseUrl)
                        .status(com.eduspace.accountservice.common.enums.PartnerAppStatus.PENDING)
                        .build();
                hostPartnerApplicationRepository.save(app);
                log.info("Host partner application created at register for user {}", user.getEmail());
            }

            String token = UUID.randomUUID().toString();
            String redisKey = REDIS_KEY_PREFIX + token;

            redisTemplate.opsForValue().set(
                    redisKey,
                    user.getKeycloakId(),
                    tokenExpiryHours,
                    TimeUnit.HOURS);

            log.info("Queue verification email for {}", user.getEmail());
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);

            activityLogService.log(ActivityLogEventType.REGISTER, ActivityLogStatus.SUCCESS, user.getId(), user.getEmail(),
                    "User registration successful", null);

            return userMapper.toUserResponse(user);
        } catch (RuntimeException ex) {
            activityLogService.log(ActivityLogEventType.REGISTER, ActivityLogStatus.FAILURE,
                    user != null ? user.getId() : null,
                    user != null ? user.getEmail() : email,
                    "User registration failed: " + ex.getClass().getSimpleName(),
                    null);
            throw ex;
        }
    }

    private static String trimNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        String redisKey = REDIS_KEY_PREFIX + token;
        UserEntity user = null;
        try {
            // Retrieve user keycloak ID from Redis
            String keycloakId = redisTemplate.opsForValue().get(redisKey);

            if (keycloakId == null) {
                log.warn("Invalid or expired verification token: {}", token);
                throw new AppException(ErrorCode.VERIFICATION_TOKEN_INVALID);
            }

            user = userRepository.findByKeycloakId(keycloakId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Verify user in Keycloak. If local keycloakId is stale (e.g. realm re-imported),
            // recover by email and sync keycloakId instead of returning 500.
            try {
                keycloakUserService.verifyEmail(keycloakId);
            } catch (NotFoundException ex) {
                log.warn("Keycloak user not found by id={} during verify-email. Trying recovery by email={}",
                        keycloakId, user.getEmail());
                String resolvedKeycloakId = keycloakUserService.findUserIdByEmail(user.getEmail())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                if (!resolvedKeycloakId.equals(user.getKeycloakId())) {
                    user.setKeycloakId(resolvedKeycloakId);
                    userRepository.save(user);
                    log.info("Synced local keycloakId for {} from {} -> {}",
                            user.getEmail(), keycloakId, resolvedKeycloakId);
                }
                keycloakUserService.verifyEmail(resolvedKeycloakId);
            }

            // Update isEmailVerified in Local DB
            user.setIsEmailVerified(true);
            userRepository.save(user);

            // Remove token from Redis after successful verification
            redisTemplate.delete(redisKey);

            activityLogService.log(ActivityLogEventType.VERIFY_EMAIL, ActivityLogStatus.SUCCESS,
                    user.getId(), user.getEmail(), "Email verification successful", null);
            log.info("Successfully verified email for user keycloak ID: {}", keycloakId);
        } catch (RuntimeException ex) {
            activityLogService.log(ActivityLogEventType.VERIFY_EMAIL, ActivityLogStatus.FAILURE,
                    user != null ? user.getId() : null,
                    user != null ? user.getEmail() : null,
                    "Email verification failed: " + ex.getClass().getSimpleName(),
                    null);
            throw ex;
        }
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        try {
            LoginResponse response = keycloakUserService.refreshToken(refreshToken);
            activityLogService.log(ActivityLogEventType.REFRESH_TOKEN, ActivityLogStatus.SUCCESS,
                    null, null, "Token refresh successful", null);
            return response;
        } catch (RuntimeException ex) {
            activityLogService.log(ActivityLogEventType.REFRESH_TOKEN, ActivityLogStatus.FAILURE,
                    null, null, "Token refresh failed: " + ex.getClass().getSimpleName(), null);
            throw ex;
        }
    }

    @Override
    public void logout(String refreshToken) {
        try {
            keycloakUserService.logout(refreshToken);
            activityLogService.log(ActivityLogEventType.LOGOUT, ActivityLogStatus.SUCCESS,
                    null, null, "User logout successful", null);
        } catch (RuntimeException ex) {
            activityLogService.log(ActivityLogEventType.LOGOUT, ActivityLogStatus.FAILURE,
                    null, null, "User logout failed: " + ex.getClass().getSimpleName(), null);
            throw ex;
        }
    }
}
