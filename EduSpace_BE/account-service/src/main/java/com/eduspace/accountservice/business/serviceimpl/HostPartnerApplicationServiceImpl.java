package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.HostPartnerApplicationService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.PartnerAppStatus;
import com.eduspace.accountservice.common.enums.HostPartnerApplicationUserStatus;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.hostapplication.RejectHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.request.hostapplication.SubmitHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.response.hostapplication.HostPartnerApplicationAdminResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.MyHostApplicationStatusResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.PendingBranchUpdateResponse;
import com.eduspace.accountservice.model.entity.HostPartnerApplicationEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.HostPartnerApplicationRepository;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    private static boolean isBranchApplication(String applicantType) {
        return applicantType != null && "BRANCH".equalsIgnoreCase(applicantType.trim());
    }

    /**
     * Giống {@link com.eduspace.accountservice.presentation.controller.UserController}: một số JWT không có {@code sub},
     * tra user theo email claim.
     */
    private UserEntity resolveUserFromJwt(Jwt jwt) {
        if (jwt == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String sub = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String preferredUsername = jwt.getClaimAsString("preferred_username");
        String username = jwt.getClaimAsString("username");

        String candidateEmail = StringUtils.hasText(email) ? email : (StringUtils.hasText(preferredUsername) ? preferredUsername : username);
        if (StringUtils.hasText(candidateEmail)) {
            Optional<UserEntity> byEmail = userRepository.findByEmail(candidateEmail.trim());
            if (byEmail.isPresent()) {
                return byEmail.get();
            }
        }

        // Fallback to Keycloak user id (sub) if email resolution failed.
        if (StringUtils.hasText(sub)) {
            Optional<UserEntity> byKeycloakId = userRepository.findByKeycloakId(sub);
            if (byKeycloakId.isPresent()) {
                return byKeycloakId.get();
            }
        }

        log.warn("Cannot resolve local user from JWT. sub={}, email={}, preferred_username={}, username={}",
                sub, email, preferredUsername, username);
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
                .findByUserIdAndStatus(user.getId(), com.eduspace.accountservice.common.enums.PartnerAppStatus.PENDING);
        if (pending.isPresent()) {
            HostPartnerApplicationEntity app = pending.get();
            return MyHostApplicationStatusResponse.builder()
                    .status(HostPartnerApplicationUserStatus.PENDING)
                    .applicationId(app.getId())
                    .submittedAt(app.getCreatedAt())
                    .build();
        }

        List<HostPartnerApplicationEntity> rejected = applicationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), com.eduspace.accountservice.common.enums.PartnerAppStatus.REJECTED);
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
    public List<PendingBranchUpdateResponse> listMyPendingBranchUpdates(Jwt jwt) {
        UserEntity user = resolveUserFromJwt(jwt);
        List<HostPartnerApplicationEntity> pendingBranches = applicationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), PartnerAppStatus.PENDING)
                .stream()
                .filter(e -> isBranchApplication(e.getApplicantType()))
                .toList();

        Map<Integer, PendingBranchUpdateResponse> dedup = new LinkedHashMap<>();
        for (HostPartnerApplicationEntity app : pendingBranches) {
            Map<String, String> meta = parseMessageMeta(app.getMessage());
            String action = normalize(meta.get("action"));
            if (!"update".equals(action)) {
                continue;
            }
            Integer propertyId = parseInteger(meta.get("propertyid"));
            if (propertyId == null || dedup.containsKey(propertyId)) {
                continue;
            }
            dedup.put(propertyId, PendingBranchUpdateResponse.builder()
                    .propertyId(propertyId)
                    .submittedAt(app.getCreatedAt())
                    .build());
        }
        return dedup.values().stream().toList();
    }

    @Override
    @Transactional
    public void submit(Jwt jwt, SubmitHostPartnerApplicationRequest request) {
        UserEntity user = resolveUserFromJwt(jwt);
        String applicantType = trimToNull(request.getApplicantType());
        String fullName = trimToNull(request.getFullName());
        String email = trimToNull(request.getEmail());
        String phone = trimToNull(request.getPhone());
        String address = trimToNull(request.getAddress());
        String message = trimToNull(request.getMessage());

        if (!StringUtils.hasText(applicantType) || !StringUtils.hasText(fullName) || !StringUtils.hasText(email)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (applicantType.length() > 32 || fullName.length() > 255 || (phone != null && phone.length() > 50)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        boolean branchApplication = isBranchApplication(applicantType);

        if (userIsHostPartner(user) && !branchApplication) {
            throw new AppException(ErrorCode.HOST_ALREADY_PARTNER);
        }

        if (!branchApplication) {
            if (applicationRepository.findByUserIdAndStatus(user.getId(), PartnerAppStatus.PENDING).isPresent()) {
                throw new AppException(ErrorCode.HOST_APPLICATION_PENDING_EXISTS);
            }
        } else {
            // For BRANCH applications, allow multiple pending requests as long as branch identity differs.
            List<HostPartnerApplicationEntity> pendingBranches = applicationRepository
                    .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), PartnerAppStatus.PENDING)
                    .stream()
                    .filter(e -> isBranchApplication(e.getApplicantType()))
                    .toList();

            String reqName = normalize(fullName);
            String reqPhone = normalize(phone);
            String reqEmail = normalize(email);
            String reqAddress = normalize(address);

            boolean duplicated = pendingBranches.stream().anyMatch(e ->
                    Objects.equals(normalize(e.getFullName()), reqName)
                            && Objects.equals(normalize(e.getPhone()), reqPhone)
                            && Objects.equals(normalize(e.getEmail()), reqEmail)
                            && Objects.equals(normalize(e.getAddress()), reqAddress));

            if (duplicated) {
                throw new AppException(ErrorCode.HOST_APPLICATION_PENDING_EXISTS);
            }
        }

        HostPartnerApplicationEntity entity = HostPartnerApplicationEntity.builder()
                .userId(user.getId())
                .applicantType(applicantType)
                .fullName(fullName)
                .phone(phone)
                .email(email)
                .address(address)
                .message(message)
                .documentFrontUrl(trimToNull(request.getDocumentFrontUrl()))
                .documentBackUrl(trimToNull(request.getDocumentBackUrl()))
                .businessLicenseUrl(trimToNull(request.getBusinessLicenseUrl()))
                .status(PartnerAppStatus.PENDING)
                .build();
        try {
            applicationRepository.save(entity);
        } catch (DataIntegrityViolationException ex) {
            // Guard concurrent requests that pass pre-check at the same time.
            throw new AppException(ErrorCode.HOST_APPLICATION_PENDING_EXISTS);
        }
    }

    @Override
    public List<HostPartnerApplicationAdminResponse> listPendingForAdmin() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc(PartnerAppStatus.PENDING).stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Override
    @Transactional
    public void approve(UUID applicationId, String adminKeycloakId) {
        HostPartnerApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_APPLICATION_NOT_FOUND));
        if (app.getStatus() != PartnerAppStatus.PENDING) {
            throw new AppException(ErrorCode.HOST_APPLICATION_BAD_STATE);
        }

        UserEntity user = userRepository.findById(app.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean branchApplication = isBranchApplication(app.getApplicantType());
        if (!branchApplication) {
            RoleEntity tutorRole = roleRepository.findByName(Role.TUTOR.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            boolean hasTutor = user.getRoles().stream().anyMatch(r -> Role.TUTOR.getName().equalsIgnoreCase(r.getName()));
            if (!hasTutor) {
                user.getRoles().add(tutorRole);
                userRepository.save(user);
            }
        }

        app.setStatus(PartnerAppStatus.APPROVED);
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewedBy(adminKeycloakId);
        applicationRepository.save(app);

        if (!branchApplication) {
            try {
                keycloakUserService.assignRole(user.getKeycloakId(), Role.TUTOR.getName());
            } catch (Exception e) {
                log.error("Keycloak assign TUTOR failed for user {}: {}", user.getKeycloakId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void reject(UUID applicationId, String adminKeycloakId, RejectHostPartnerApplicationRequest request) {
        HostPartnerApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.HOST_APPLICATION_NOT_FOUND));
        if (app.getStatus() != PartnerAppStatus.PENDING) {
            throw new AppException(ErrorCode.HOST_APPLICATION_BAD_STATE);
        }
        app.setStatus(PartnerAppStatus.REJECTED);
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

    private static String normalize(String s) {
        if (s == null) {
            return null;
        }
        String out = s.trim().toLowerCase();
        return out.replaceAll("\\s+", " ");
    }

    private static Integer parseInteger(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static Map<String, String> parseMessageMeta(String message) {
        Map<String, String> out = new LinkedHashMap<>();
        if (!StringUtils.hasText(message)) {
            return out;
        }
        String[] parts = message.split("\\|");
        for (String rawPart : parts) {
            String part = rawPart == null ? "" : rawPart.trim();
            int idx = part.indexOf('=');
            if (idx <= 0 || idx >= part.length() - 1) {
                continue;
            }
            String key = normalize(part.substring(0, idx));
            String value = part.substring(idx + 1).trim();
            if (key != null && StringUtils.hasText(value)) {
                out.put(key, value);
            }
        }
        return out;
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
