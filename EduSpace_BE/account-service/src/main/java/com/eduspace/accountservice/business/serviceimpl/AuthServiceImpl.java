package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.AuthService;
import com.eduspace.accountservice.business.service.EmailService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.LoginRequest;
import com.eduspace.accountservice.model.dto.response.LoginResponse;
import com.eduspace.accountservice.model.dto.request.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private static final String REDIS_KEY_PREFIX = "email_verify:";

    @Value("${app.verification.token-expiry-hours}")
    private int tokenExpiryHours;

    @Override
    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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

        return keycloakUserService.authenticate(request.getEmail(), request.getPassword(), null);
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        String keycloakId = keycloakUserService.createUser(
                request.getEmail(), request.getFullName(), request.getPassword());

        RoleEntity studentRole = roleRepository.findByName(Role.STUDENT.getName())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        UserEntity user = UserEntity.builder()
                .keycloakId(keycloakId)
                .email(request.getEmail())
                .fullName(request.getFullName())
                .roles(Set.of(studentRole))
                .build();

        userRepository.save(user);
        log.info("User registered: {} (keycloakId: {})", request.getEmail(), keycloakId);

        String token = UUID.randomUUID().toString();
        String redisKey = REDIS_KEY_PREFIX + token;

        redisTemplate.opsForValue().set(
                redisKey,
                user.getKeycloakId(),
                tokenExpiryHours,
                TimeUnit.HOURS);

        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);

        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        String redisKey = REDIS_KEY_PREFIX + token;

        // Retrieve user keycloak ID from Redis
        String keycloakId = redisTemplate.opsForValue().get(redisKey);

        if (keycloakId == null) {
            log.warn("Invalid or expired verification token: {}", token);
            throw new AppException(ErrorCode.VERIFICATION_TOKEN_INVALID);
        }

        // Verify user in Keycloak
        keycloakUserService.verifyEmail(keycloakId);

        // Update isEmailVerified in Local DB
        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsEmailVerified(true);
        userRepository.save(user);

        // Remove token from Redis after successful verification
        redisTemplate.delete(redisKey);

        log.info("Successfully verified email for user keycloak ID: {}", keycloakId);
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        return keycloakUserService.refreshToken(refreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        keycloakUserService.logout(refreshToken);
    }
}
