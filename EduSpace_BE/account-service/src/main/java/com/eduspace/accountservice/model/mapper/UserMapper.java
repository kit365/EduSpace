package com.eduspace.accountservice.model.mapper;

import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
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
        if (request.getStudentId() != null) {
            entity.setStudentId(request.getStudentId());
        }
        if (request.getLocation() != null) {
            entity.setLocation(request.getLocation());
        }
        if (request.getShortBio() != null) {
            entity.setShortBio(request.getShortBio());
        }
    }

    public UserResponse toUserResponse(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        return UserResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .avatarUrl(entity.getAvatarUrl())
                .studentId(entity.getStudentId())
                .location(entity.getLocation())
                .shortBio(entity.getShortBio())
                .isActive(entity.getIsActive())
                .isEmailVerified(entity.getIsEmailVerified())
                .is2faEnabled(entity.getIs2faEnabled())
                .roles(mapRoles(entity.getRoles()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
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
