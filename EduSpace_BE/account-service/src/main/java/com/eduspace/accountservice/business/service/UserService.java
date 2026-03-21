package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse getProfile(String keycloakId);

    UserResponse getProfileByEmail(String email);

    UserResponse updateProfile(String keycloakId, String email, UpdateProfileRequest request);

    void changePassword(String keycloakId, String email, String oldPassword, String newPassword);

    TwoFactorResponse generate2faSecret(String email);

    void enable2fa(String email, String code);

    void disable2fa(String email, String code);

    PublicUserProfileResponse getPublicProfileByUserId(String userId);

    List<PublicUserProfileResponse> getPublicProfilesByUserIds(List<String> userIds);

    PublicUserProfileResponse getPublicProfileByKeycloakId(String keycloakId);

    List<PublicUserProfileResponse> getPublicProfilesByKeycloakIds(List<String> keycloakIds);

    List<PublicUserProfileResponse> searchPublicProfiles(String query, int limit);

    PageResponse<UserResponse> getAllUsers(Pageable pageable, String search, List<String> roles, String status, String kyc, String identifier, boolean isEmail);

    void approveUserKyc(String userId);

    void rejectUserKyc(String userId, String reason);
}
