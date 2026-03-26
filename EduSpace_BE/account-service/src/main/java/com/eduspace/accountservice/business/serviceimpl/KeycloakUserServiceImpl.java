package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakUserServiceImpl implements KeycloakUserService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

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

        String usernameForToken = resolveUsernameForPasswordGrant(email);
        if (!usernameForToken.equalsIgnoreCase(email.trim())) {
            log.info("Keycloak password grant: dùng username '{}' (đăng nhập bằng email '{}')", usernameForToken, email);
        }

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("username", usernameForToken);
        map.add("password", password);
        map.add("scope", "openid");

        if (otp != null && !otp.trim().isEmpty()) {
            map.add("totp", otp.trim());
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            return restTemplate.postForObject(tokenUrl, request, LoginResponse.class);
        } catch (HttpClientErrorException e) {
            log.error(
                    "Keycloak password grant failed (đăng nhập bằng username gửi lên Keycloak: {}). HTTP {} Body: {}",
                    usernameForToken,
                    e.getStatusCode(),
                    e.getResponseBodyAsString());
            String keycloakHint = parseKeycloakErrorBody(e.getResponseBodyAsString());
            throw new AppException(ErrorCode.UNAUTHORIZED, keycloakHint);
        } catch (ResourceAccessException e) {
            log.error("Cannot reach Keycloak at {} (token URL). User: {}. {}", serverUrl, email, e.getMessage());
            throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE);
        } catch (Exception e) {
            Throwable c = e.getCause();
            if (c instanceof java.net.ConnectException || c instanceof java.net.UnknownHostException) {
                log.error("Cannot reach Keycloak at {}. User: {}", serverUrl, email, e);
                throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE);
            }
            log.error("Authentication failed for user: {}. Error: {}", email, e.getMessage());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * Keycloak token endpoint returns JSON: {@code {"error":"invalid_grant","error_description":"..."}}.
     */
    /**
     * Token endpoint thường nhận trường {@code username}. Nếu trong Keycloak username khác email
     * (vd. username {@code admin}, email {@code admin@eduspace.vn}), gửi đúng username lấy từ Admin API
     * tránh {@code invalid_grant} dù đã mở login bằng email trên realm.
     */
    private String resolveUsernameForPasswordGrant(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }
        try {
            List<UserRepresentation> byEmail = keycloak.realm(realm).users().searchByEmail(email.trim(), true);
            if (byEmail != null && !byEmail.isEmpty()) {
                String u = byEmail.get(0).getUsername();
                if (u != null && !u.isBlank()) {
                    return u.trim();
                }
            }
            List<UserRepresentation> users = keycloak.realm(realm).users().search(email.trim(), true);
            if (users != null && !users.isEmpty()) {
                String u = users.get(0).getUsername();
                if (u != null && !u.isBlank()) {
                    return u.trim();
                }
            }
        } catch (RuntimeException ex) {
            log.warn("Không tra được username Keycloak cho email {}, dùng luôn email làm username. {}", email, ex.getMessage());
        }
        return email.trim();
    }

    private static String parseKeycloakErrorBody(String body) {
        if (body == null || body.isBlank()) {
            return null;
        }
        try {
            JsonNode n = OBJECT_MAPPER.readTree(body);
            String desc = n.path("error_description").asText(null);
            if (desc != null && !desc.isBlank()) {
                return desc;
            }
            String err = n.path("error").asText(null);
            if (err != null && !err.isBlank()) {
                return err;
            }
        } catch (Exception ignored) {
            // fall through
        }
        return null;
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

        // Email/username already exists — treat as success and resolve id (avoids noisy startup errors).
        if (response.getStatus() == 409) {
            String errorBody = response.readEntity(String.class);
            response.close();
            log.info("User already exists in Keycloak for {} (409). Resolving id by email. Body: {}", email, errorBody);
            String existingKeycloakId = findUserIdByEmail(email).orElseThrow(() -> new RuntimeException(
                    "User exists in Keycloak but id could not be resolved for email: " + email));

            // Important: when local user isn't found but keycloak user already exists,
            // we must update credentials so invited temporary password works.
            try {
                CredentialRepresentation resetCredential = new CredentialRepresentation();
                resetCredential.setType(CredentialRepresentation.PASSWORD);
                resetCredential.setValue(password);
                resetCredential.setTemporary(false);
                keycloak.realm(realm).users().get(existingKeycloakId).resetPassword(resetCredential);
            } catch (Exception e) {
                log.warn("Failed to reset password for existing Keycloak user {} (id={}): {}",
                        email,
                        existingKeycloakId,
                        e.getMessage());
            }

            return existingKeycloakId;
        }

        String errorBody = response.readEntity(String.class);
        response.close();
        log.error("Failed to create user in Keycloak. Status: {}, Body: {}", response.getStatus(), errorBody);
        throw new RuntimeException("Failed to create user in Keycloak: " + errorBody);
    }

    @Override
    public void assignRole(String userId, String roleName) {
        try {
            // Check if role exists
            keycloak.realm(realm).roles().get(roleName).toRepresentation();
        } catch (jakarta.ws.rs.NotFoundException e) {
            log.info("Role '{}' not found in Keycloak. Creating it now...", roleName);
            RoleRepresentation newRole = new RoleRepresentation();
            newRole.setName(roleName);
            keycloak.realm(realm).roles().create(newRole);
        }

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
    public void removeRealmRole(String userId, String roleName) {
        try {
            RoleRepresentation role = keycloak.realm(realm)
                    .roles()
                    .get(roleName)
                    .toRepresentation();
            keycloak.realm(realm)
                    .users()
                    .get(userId)
                    .roles()
                    .realmLevel()
                    .remove(List.of(role));
            log.info("Removed realm role '{}' from user '{}'", roleName, userId);
        } catch (jakarta.ws.rs.NotFoundException e) {
            log.warn("Role '{}' not found or not assigned for user '{}': {}", roleName, userId, e.getMessage());
        }
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
        map.add("refresh_token", sanitizeRefreshToken(refreshToken));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            return restTemplate.postForObject(tokenUrl, request, LoginResponse.class);
        } catch (HttpClientErrorException e) {
            log.error("Token refresh failed. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            String keycloakHint = parseKeycloakErrorBody(e.getResponseBodyAsString());
            throw new AppException(ErrorCode.UNAUTHORIZED, keycloakHint);
        } catch (ResourceAccessException e) {
            log.error("Cannot reach Keycloak at {} (refresh). {}", serverUrl, e.getMessage());
            throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE);
        } catch (Exception e) {
            Throwable c = e.getCause();
            if (c instanceof java.net.ConnectException || c instanceof java.net.UnknownHostException) {
                throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE);
            }
            log.error("Token refresh failed. Error: {}", e.getMessage());
            throw new AppException(ErrorCode.UNAUTHORIZED);
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
        map.add("refresh_token", sanitizeRefreshToken(refreshToken));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            restTemplate.postForLocation(logoutUrl, request);
            log.info("Successfully logged out user globally in Keycloak");
        } catch (Exception e) {
            log.error("Logout failed. Error: {}", e.getMessage());
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    private String sanitizeRefreshToken(String refreshToken) {
        if (refreshToken == null) {
            return null;
        }
        String sanitized = refreshToken.trim();
        if (sanitized.regionMatches(true, 0, "Bearer ", 0, 7)) {
            sanitized = sanitized.substring(7).trim();
        }
        return sanitized;
    }

    @Override
    public void deleteUser(String keycloakUserId) {
        keycloak.realm(realm).users().get(keycloakUserId).remove();
        log.info("Deleted user from Keycloak: {}", keycloakUserId);
    }

    @Override
    public java.util.Optional<String> findUserIdByEmail(String email) {
        // Prefer email-specific search — search(String, boolean) matches username/display fields and can miss users.
        List<UserRepresentation> byEmail = keycloak.realm(realm).users().searchByEmail(email, true);
        if (byEmail != null && !byEmail.isEmpty()) {
            return java.util.Optional.of(byEmail.get(0).getId());
        }
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
        } catch (AppException e) {
            if (e.getErrorCode() == ErrorCode.KEYCLOAK_UNAVAILABLE) {
                throw e;
            }
            log.error("Invalid old password for user: {}", email);
            throw new AppException(ErrorCode.UNAUTHORIZED);
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

    @Override
    public void resetPassword(String keycloakUserId, String newPassword, boolean temporary) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(temporary);
        try {
            keycloak.realm(realm).users().get(keycloakUserId).resetPassword(credential);
        } catch (Exception e) {
            log.error("Failed to reset password for keycloak user {}", keycloakUserId, e);
            throw e;
        }
    }
}
