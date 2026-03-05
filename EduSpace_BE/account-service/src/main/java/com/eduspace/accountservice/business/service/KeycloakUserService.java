package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.response.LoginResponse;

public interface KeycloakUserService {

    String createUser(String email, String fullName, String password);

    LoginResponse authenticate(String email, String password, String otp);

    void assignRole(String userId, String roleName);

    void verifyEmail(String keycloakUserId);

    LoginResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    void deleteUser(String keycloakUserId);

    java.util.Optional<String> findUserIdByEmail(String email);

    void changePassword(String keycloakUserId, String email, String oldPassword, String newPassword);
}
