package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;

public interface KeycloakUserService {

    String createUser(String email, String fullName, String password);

    LoginResponse authenticate(String email, String password, String otp);

    void assignRole(String userId, String roleName);

    /** Remove a realm role from a user (no-op if not assigned). */
    void removeRealmRole(String userId, String roleName);

    void verifyEmail(String keycloakUserId);

    LoginResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    void deleteUser(String keycloakUserId);

    java.util.Optional<String> findUserIdByEmail(String email);

    void changePassword(String keycloakUserId, String email, String oldPassword, String newPassword);

    /** Reset mật khẩu trực tiếp (không cần oldPassword). */
    void resetPassword(String keycloakUserId, String newPassword, boolean temporary);
}
