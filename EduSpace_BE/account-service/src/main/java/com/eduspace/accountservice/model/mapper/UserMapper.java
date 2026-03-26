package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.EkycVerificationRepository;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final EkycVerificationRepository ekycVerificationRepository;
    private final PermissionRepository permissionRepository;


    public void updateUserEntityFromRequest(UpdateProfileRequest request, UserEntity entity) {
        if (request == null || entity == null) {
            return;
        }

        if (request.getFullName() != null) {
            entity.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            entity.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAvatarUrl() != null) {
            entity.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getDateOfBirth() != null) {
            entity.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getLocation() != null) {
            entity.setLocation(request.getLocation());
        }
        if (request.getShortBio() != null) {
            entity.setShortBio(request.getShortBio());
        }
        if (request.getCityState() != null) {
            entity.setCityState(request.getCityState());
        }
        if (request.getDistrict() != null) {
            entity.setDistrict(request.getDistrict());
        }
        if (request.getWard() != null) {
            entity.setWard(request.getWard());
        }
        if (request.getStreetAddress() != null) {
            entity.setStreetAddress(request.getStreetAddress());
        }
        if (request.getPostalCode() != null) {
            entity.setPostalCode(request.getPostalCode());
        }
        if (request.getTaxId() != null) {
            entity.setTaxId(request.getTaxId());
        }
        if (request.getOrganizationName() != null) {
            entity.setOrganizationName(request.getOrganizationName());
        }
    }

    public UserResponse toUserResponse(UserEntity entity) {
        return toUserResponse(entity, null);
    }

    /**
     * @param extraPermissionNames optional direct grants (e.g. STAFF Level-2 operational permissions)
     */
    public UserResponse toUserResponse(UserEntity entity, Set<String> extraPermissionNames) {
        if (entity == null) {
            return null;
        }

        Set<String> permissions = mapRolePermissionNames(entity);
        if (extraPermissionNames != null && !extraPermissionNames.isEmpty()) {
            permissions.addAll(extraPermissionNames);
        }

        return UserResponse.builder()
                .id(entity.getId())
                .keycloakId(entity.getKeycloakId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .avatarUrl(entity.getAvatarUrl())
                .location(entity.getLocation())
                .dateOfBirth(entity.getDateOfBirth())
                .hostType(entity.getHostType())
                .organizationName(entity.getOrganizationName())
                .verificationDocument(entity.getVerificationDocument())
                .verificationStatus(entity.getVerificationStatus())
                .shortBio(entity.getShortBio())
                .cityState(entity.getCityState())
                .district(entity.getDistrict())
                .ward(entity.getWard())
                .streetAddress(entity.getStreetAddress())
                .postalCode(entity.getPostalCode())
                .taxId(entity.getTaxId())
                .isActive(entity.getIsActive())
                .isEmailVerified(entity.getIsEmailVerified())
                .is2faEnabled(entity.getIs2faEnabled())
                .pointBalance(entity.getPointBalance())
                .roles(mapRoles(entity.getRoles()))
                .permissions(permissions)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .ocrData(mapOcrData(entity.getId()))
                .faceMatchPercentage(mapFaceMatch(entity.getId()))
                .build();
    }

    private UserResponse.OcrData mapOcrData(String userId) {
        return ekycVerificationRepository.findAll().stream()
                .filter(e -> e.getUserId().equals(userId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .findFirst()
                .map(e -> UserResponse.OcrData.builder()
                        .name(e.getOcrName())
                        .idNumber(e.getOcrIdNumber())
                        .dob(e.getOcrDob())
                        .address(e.getOcrAddress())
                        .build())
                .orElse(null);
    }

    private Double mapFaceMatch(String userId) {
        return ekycVerificationRepository.findAll().stream()
                .filter(e -> e.getUserId().equals(userId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .findFirst()
                .map(EkycVerificationEntity::getFaceDistance)
                .map(d -> Math.max(0, Math.min(100, 100 * (1 - d))))
                .orElse(null);
    }

    public PublicUserProfileResponse toPublicUserProfile(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        return PublicUserProfileResponse.builder()
                .keycloakId(entity.getKeycloakId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .avatarUrl(entity.getAvatarUrl())
                .build();
    }

    private Set<String> mapRoles(Set<RoleEntity> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .map(RoleEntity::getName)
                .collect(Collectors.toSet());
    }

    private Set<String> mapRolePermissionNames(UserEntity entity) {
        if (entity == null || entity.getRoles() == null) {
            return Collections.emptySet();
        }

        boolean isAdmin = entity.getRoles().stream()
                .anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getName()) || "SUPER_ADMIN".equalsIgnoreCase(r.getName()));

        if (isAdmin) {
            return permissionRepository.findAll().stream()
                    .map(PermissionEntity::getName)
                    .filter(name -> name != null && !name.isBlank())
                    .map(String::trim)
                    .collect(Collectors.toSet());
        }

        Set<String> out = new LinkedHashSet<>();
        for (RoleEntity role : entity.getRoles()) {
            if (role.getPermissions() == null) {
                continue;
            }
            for (PermissionEntity p : role.getPermissions()) {
                if (p != null && p.getName() != null && !p.getName().isBlank()) {
                    out.add(p.getName().trim());
                }
            }
        }
        return out;
    }
}
