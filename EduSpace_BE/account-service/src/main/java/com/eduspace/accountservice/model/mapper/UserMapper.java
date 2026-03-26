package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.common.enums.VerificationStatus;
import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Comparator;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

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
        if (request.getHostType() != null) {
            entity.setHostType(request.getHostType());
        }
        if (request.getOrganizationName() != null) {
            entity.setOrganizationName(request.getOrganizationName());
        }
    }

    public UserResponse toUserResponse(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        UserResponse response = UserResponse.builder()
                .id(entity.getId())
                .keycloakId(entity.getKeycloakId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .avatarUrl(entity.getAvatarUrl())
                .location(entity.getLocation())
                .hostType(entity.getHostType())
                .organizationName(entity.getOrganizationName())
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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        // Populate verified fields from eKYC if available
        findLatestVerified(entity).ifPresent(ekyc -> {
            response.setLegalName(ekyc.getLegalName());
            response.setIdCardNumber(ekyc.getIdCardNumber());
            response.setDob(ekyc.getDob());
            response.setVerifiedAddress(ekyc.getAddress());
            response.setIdCardFrontUrl(ekyc.getIdCardFrontUrl());
        });

        return response;
    }

    private Optional<EkycVerificationEntity> findLatestVerified(UserEntity entity) {
        if (entity.getEkycVerifications() == null) {
            return Optional.empty();
        }
        return entity.getEkycVerifications().stream()
                .filter(v -> v.getStatus() == VerificationStatus.VERIFIED)
                .max(Comparator.comparing(EkycVerificationEntity::getCreatedAt));
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
}
