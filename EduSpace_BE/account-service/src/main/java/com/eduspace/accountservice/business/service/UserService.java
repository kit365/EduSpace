package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getProfile(String keycloakId);

    UserResponse getProfileByEmail(String email);

    UserResponse updateProfile(String keycloakId, String email, UpdateProfileRequest request);

    void changePassword(String keycloakId, String email, String oldPassword, String newPassword);

    com.eduspace.accountservice.model.dto.response.TwoFactorResponse generate2faSecret(String email);

    void enable2fa(String email, String code);

    void disable2fa(String email, String code);

    PublicUserProfileResponse getPublicProfileByUserId(String userId);

    List<PublicUserProfileResponse> getPublicProfilesByUserIds(List<String> userIds);

    PublicUserProfileResponse getPublicProfileByKeycloakId(String keycloakId);

    List<PublicUserProfileResponse> getPublicProfilesByKeycloakIds(List<String> keycloakIds);

    List<PublicUserProfileResponse> searchPublicProfiles(String query, int limit);
}
