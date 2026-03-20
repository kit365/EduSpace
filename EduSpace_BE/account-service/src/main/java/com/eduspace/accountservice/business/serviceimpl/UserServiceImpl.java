package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.dto.response.TwoFactorResponse;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.persistence.repository.UserRepository;
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

import java.util.List;

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
}
