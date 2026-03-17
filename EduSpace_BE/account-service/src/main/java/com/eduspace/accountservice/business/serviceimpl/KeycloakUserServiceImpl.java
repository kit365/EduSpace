package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.response.LoginResponse;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakUserServiceImpl implements KeycloakUserService {

    private final Keycloak keycloak;
    private final RestTemplate restTemplate;

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Override
    public LoginResponse authenticate(String email, String password, String otp) {
        String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("username", email);
        map.add("password", password);
        map.add("scope", "openid");

        if (otp != null && !otp.trim().isEmpty()) {
            map.add("totp", otp.trim());
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            return restTemplate.postForObject(tokenUrl, request, LoginResponse.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Authentication failed for user: {}. Status: {}, Body: {}", email, e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new com.eduspace.accountservice.exception.AppException(
                    com.eduspace.accountservice.exception.ErrorCode.UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}. Error: {}", email, e.getMessage());
            throw new com.eduspace.accountservice.exception.AppException(
                    com.eduspace.accountservice.exception.ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public String createUser(String email, String fullName, String password) {
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(fullName);
        user.setEmailVerified(false);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        user.setCredentials(List.of(credential));

        Response response = keycloak.realm(realm).users().create(user);

        if (response.getStatus() == 201) {
            String keycloakUserId = CreatedResponseUtil.getCreatedId(response);
            log.info("Created user in Keycloak: {} (ID: {})", email, keycloakUserId);
            try {
                assignRole(keycloakUserId, Role.GUEST.getName());
            } catch (Exception e) {
                log.warn("Failed to assign role {} to user {}. Will retry later. Error: {}", Role.GUEST.getName(),
                        email,
                        e.getMessage());
            }
            return keycloakUserId;
        }

        String errorBody = response.readEntity(String.class);
        log.error("Failed to create user in Keycloak. Status: {}, Body: {}", response.getStatus(), errorBody);
        throw new RuntimeException("Failed to create user in Keycloak: " + errorBody);
    }

    @Override
    public void assignRole(String userId, String roleName) {
        RoleRepresentation role = keycloak.realm(realm)
                .roles()
                .get(roleName)
                .toRepresentation();

        keycloak.realm(realm)
                .users()
                .get(userId)
                .roles()
                .realmLevel()
                .add(List.of(role));

        log.info("Assigned role '{}' to user '{}'", roleName, userId);
    }

    @Override
    public void verifyEmail(String keycloakUserId) {
        UserRepresentation user = keycloak.realm(realm).users().get(keycloakUserId).toRepresentation();

        if (Boolean.TRUE.equals(user.isEmailVerified())) {
            log.info("Email is already verified for Keycloak User ID: {}", keycloakUserId);
            return;
        }

        user.setEmailVerified(true);
        keycloak.realm(realm).users().get(keycloakUserId).update(user);
        log.info("Successfully marked email as verified for Keycloak User ID: {}", keycloakUserId);
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "refresh_token");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            return restTemplate.postForObject(tokenUrl, request, LoginResponse.class);
        } catch (Exception e) {
            log.error("Token refresh failed. Error: {}", e.getMessage());
            throw new RuntimeException("Refresh token failed: " + e.getMessage());
        }
    }

    @Override
    public void logout(String refreshToken) {
        String logoutUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/logout";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            restTemplate.postForLocation(logoutUrl, request);
            log.info("Successfully logged out user globally in Keycloak");
        } catch (Exception e) {
            log.error("Logout failed. Error: {}", e.getMessage());
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteUser(String keycloakUserId) {
        keycloak.realm(realm).users().get(keycloakUserId).remove();
        log.info("Deleted user from Keycloak: {}", keycloakUserId);
    }

    @Override
    public java.util.Optional<String> findUserIdByEmail(String email) {
        List<UserRepresentation> users = keycloak.realm(realm).users().search(email, true);
        if (users != null && !users.isEmpty()) {
            return java.util.Optional.of(users.get(0).getId());
        }
        return java.util.Optional.empty();
    }

    @Override
    public void changePassword(String keycloakUserId, String email, String oldPassword, String newPassword) {
        try {
            // Verify old password
            authenticate(email, oldPassword, null);
        } catch (Exception e) {
            log.error("Invalid old password for user: {}", email);
            throw new com.eduspace.accountservice.exception.AppException(
                    com.eduspace.accountservice.exception.ErrorCode.UNAUTHORIZED);
        }

        // Set new password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);

        try {
            keycloak.realm(realm).users().get(keycloakUserId).resetPassword(credential);
            log.info("Successfully changed password for user: {}", email);
        } catch (Exception e) {
            log.error("Failed to update password for user: {}", email, e);
            throw new RuntimeException("PASSWORD_UPDATE_FAILED");
        }
    }
}
