package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.HostPartnerApplicationService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.HostPartnerApplicationStatus;
import com.eduspace.accountservice.common.enums.HostPartnerApplicationUserStatus;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.hostapplication.RejectHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.request.hostapplication.SubmitHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.response.hostapplication.HostPartnerApplicationAdminResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.MyHostApplicationStatusResponse;
import com.eduspace.accountservice.model.entity.HostPartnerApplicationEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.HostPartnerApplicationRepository;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HostPartnerApplicationServiceImpl implements HostPartnerApplicationService {

    private final HostPartnerApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final KeycloakUserService keycloakUserService;

    private static boolean isHostPartnerRole(String roleName) {
        if (roleName == null) {
            return false;
        }
        String n = roleName.toUpperCase();
        return "TUTOR".equals(n) || "HOST".equals(n);
    }

    private static boolean userIsHostPartner(UserEntity u) {
        return u.getRoles().stream().map(RoleEntity::getName).anyMatch(HostPartnerApplicationServiceImpl::isHostPartnerRole);
    }

    /**
     * Giống {@link com.eduspace.accountservice.presentation.controller.UserController}: một số JWT không có {@code sub},
     * tra user theo email claim.
     */
    private UserEntity resolveUserFromJwt(Jwt jwt) {
        String sub = jwt.getSubject();
        if (StringUtils.hasText(sub)) {
            return userRepository
                    .findByKeycloakId(sub)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
        String email = jwt.getClaimAsString("email");
        if (StringUtils.hasText(email)) {
            return userRepository
                    .findByEmail(email.trim())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
        throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    @Override
    public MyHostApplicationStatusResponse getMyStatus(Jwt jwt) {
        UserEntity user = resolveUserFromJwt(jwt);

        if (userIsHostPartner(user)) {
            return MyHostApplicationStatusResponse.builder()
                    .status(HostPartnerApplicationUserStatus.APPROVED)
                    .build();
        }

        Optional<HostPartnerApplicationEntity> pending = applicationRepository
                .findByUserIdAndStatus(user.getId(), HostPartnerApplicationStatus.PENDING);
        if (pending.isPresent()) {
            HostPartnerApplicationEntity app = pending.get();
            return MyHostApplicationStatusResponse.builder()
                    .status(HostPartnerApplicationUserStatus.PENDING)
                    .applicationId(app.getId())
                    .submittedAt(app.getCreatedAt())
                    .build();
        }

        List<HostPartnerApplicationEntity> rejected = applicationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), HostPartnerApplicationStatus.REJECTED);
        if (!rejected.isEmpty()) {
            HostPartnerApplicationEntity last = rejected.get(0);
            return MyHostApplicationStatusResponse.builder()
                    .status(HostPartnerApplicationUserStatus.REJECTED)
                    .applicationId(last.getId())
                    .rejectedReason(last.getAdminNote())
                    .submittedAt(last.getCreatedAt())
                    .build();
        }

        return MyHostApplicationStatusResponse.builder()
                .status(HostPartnerApplicationUserStatus.NONE)
                .build();
    }

    @Override
    @Transactional
    public void submit(Jwt jwt, SubmitHostPartnerApplicationRequest request) {
        UserEntity user = resolveUserFromJwt(jwt);

        if (userIsHostPartner(user)) {
            throw new AppException(ErrorCode.HOST_ALREADY_PARTNER);
        }

        if (applicationRepository.findByUserIdAndStatus(user.getId(), HostPartnerApplicationStatus.PENDING).isPresent()) {
            throw new AppException(ErrorCode.HOST_APPLICATION_PENDING_EXISTS);
        }

        HostPartnerApplicationEntity entity = HostPartnerApplicationEntity.builder()
                .userId(user.getId())
                .applicantType(request.getApplicantType())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .email(request.getEmail().trim())
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .message(request.getMessage() != null ? request.getMessage().trim() : null)
                .documentFrontUrl(trimToNull(request.getDocumentFrontUrl()))
                .documentBackUrl(trimToNull(request.getDocumentBackUrl()))
                .businessLicenseUrl(trimToNull(request.getBusinessLicenseUrl()))
                .status(HostPartnerApplicationStatus.PENDING)
                .build();
        applicationRepository.save(entity);
    }

    @Override
    public List<HostPartnerApplicationAdminResponse> listPendingForAdmin() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc(HostPartnerApplicationStatus.PENDING).stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Override
    @Transactional
    public void approve(UUID applicationId, String adminKeycloakId) {
        HostPartnerApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_APPLICATION_NOT_FOUND));
        if (app.getStatus() != HostPartnerApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.HOST_APPLICATION_BAD_STATE);
        }

        UserEntity user = userRepository.findById(app.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        RoleEntity tutorRole = roleRepository.findByName(Role.TUTOR.getName())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        boolean hasTutor = user.getRoles().stream().anyMatch(r -> Role.TUTOR.getName().equalsIgnoreCase(r.getName()));
        if (!hasTutor) {
            user.getRoles().add(tutorRole);
            userRepository.save(user);
        }

        app.setStatus(HostPartnerApplicationStatus.APPROVED);
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(adminKeycloakId);
        applicationRepository.save(app);

        try {
            keycloakUserService.assignRole(user.getKeycloakId(), Role.TUTOR.getName());
        } catch (Exception e) {
            log.error("Keycloak assign TUTOR failed for user {}: {}", user.getKeycloakId(), e.getMessage());
        }
    }

    @Override
    @Transactional
    public void reject(UUID applicationId, String adminKeycloakId, RejectHostPartnerApplicationRequest request) {
        HostPartnerApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_APPLICATION_NOT_FOUND));
        if (app.getStatus() != HostPartnerApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.HOST_APPLICATION_BAD_STATE);
        }
        app.setStatus(HostPartnerApplicationStatus.REJECTED);
        app.setAdminNote(request.getAdminNote());
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(adminKeycloakId);
        applicationRepository.save(app);
    }

    private static String trimToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private HostPartnerApplicationAdminResponse toAdminResponse(HostPartnerApplicationEntity e) {
        String msg = e.getMessage();
        if (e.getDocumentFrontUrl() != null || e.getDocumentBackUrl() != null || e.getBusinessLicenseUrl() != null) {
            String doc = String.format(
                    " [KYC URL] front=%s back=%s license=%s",
                    e.getDocumentFrontUrl() != null ? e.getDocumentFrontUrl() : "-",
                    e.getDocumentBackUrl() != null ? e.getDocumentBackUrl() : "-",
                    e.getBusinessLicenseUrl() != null ? e.getBusinessLicenseUrl() : "-");
            msg = (msg != null ? msg : "") + doc;
        }
        return HostPartnerApplicationAdminResponse.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .applicantType(e.getApplicantType())
                .fullName(e.getFullName())
                .phone(e.getPhone())
                .email(e.getEmail())
                .address(e.getAddress())
                .message(msg)
                .status(e.getStatus().name())
                .adminNote(e.getAdminNote())
                .createdAt(e.getCreatedAt())
                .reviewedAt(e.getReviewedAt())
                .reviewedBy(e.getReviewedBy())
                .build();
    }
}
