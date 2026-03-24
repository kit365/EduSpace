package com.eduspace.conversationservice.business.serviceimpl;

import com.azure.communication.common.CommunicationUserIdentifier;
import com.azure.communication.identity.CommunicationIdentityClient;
import com.azure.communication.identity.CommunicationIdentityClientBuilder;
import com.azure.communication.identity.models.CommunicationTokenScope;
import com.azure.communication.identity.models.CommunicationUserIdentifierAndToken;
import com.azure.core.credential.AccessToken;
import com.azure.core.credential.AzureKeyCredential;
import com.eduspace.conversationservice.business.service.AzureCommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class AzureCommunicationServiceImpl implements AzureCommunicationService {

    private final CommunicationIdentityClient identityClient;
    private final String connectionString;
    private final String endpoint;
    private final String accessKey;

    public AzureCommunicationServiceImpl(
            @Value("${app.azure.communication.connection-string:}") String connectionString,
            @Value("${app.azure.communication.endpoint:}") String endpoint,
            @Value("${app.azure.communication.access-key:}") String accessKey) {
        this.connectionString = connectionString;
        this.endpoint = endpoint;
        this.accessKey = accessKey;

        if (isConfigured()) {
            CommunicationIdentityClientBuilder builder = new CommunicationIdentityClientBuilder();
            if (hasConnectionString()) {
                builder.connectionString(connectionString);
            } else {
                builder.endpoint(endpoint).credential(new AzureKeyCredential(accessKey));
            }
            this.identityClient = builder.buildClient();
            log.info("Azure Communication Service initialized successfully");
        } else {
            this.identityClient = null;
            log.warn("Azure Communication Service is not configured (missing connection-string or endpoint/access-key)");
        }
    }

    @Override
    public Map<String, String> createUserAndToken() {
        ensureConfigured();
        try {
            CommunicationUserIdentifierAndToken userToken = identityClient.createUserAndToken(
                    Arrays.asList(CommunicationTokenScope.VOIP, CommunicationTokenScope.CHAT));
            Map<String, String> result = new HashMap<>();
            result.put("userId", userToken.getUser().getId());
            result.put("token", userToken.getUserToken().getToken());
            result.put("expiresOn", userToken.getUserToken().getExpiresAt().toString());
            return result;
        } catch (Exception e) {
            log.error("Failed to create ACS user/token", e);
            throw new RuntimeException("Failed to create ACS user and token", e);
        }
    }

    @Override
    public Map<String, String> refreshUserToken(String userId) {
        ensureConfigured();
        try {
            AccessToken accessToken = identityClient.getToken(
                    new CommunicationUserIdentifier(userId),
                    Arrays.asList(CommunicationTokenScope.VOIP, CommunicationTokenScope.CHAT));
            Map<String, String> result = new HashMap<>();
            result.put("userId", userId);
            result.put("token", accessToken.getToken());
            result.put("expiresOn", accessToken.getExpiresAt().toString());
            return result;
        } catch (Exception e) {
            log.error("Failed to refresh ACS token for {}", userId, e);
            throw new RuntimeException("Failed to refresh ACS token", e);
        }
    }

    @Override
    public void revokeUserTokens(String userId) {
        ensureConfigured();
        try {
            identityClient.revokeTokens(new CommunicationUserIdentifier(userId));
        } catch (Exception e) {
            log.error("Failed to revoke ACS tokens for {}", userId, e);
            throw new RuntimeException("Failed to revoke ACS tokens", e);
        }
    }

    @Override
    public void deleteUser(String userId) {
        ensureConfigured();
        try {
            identityClient.deleteUser(new CommunicationUserIdentifier(userId));
        } catch (Exception e) {
            log.error("Failed to delete ACS user {}", userId, e);
            throw new RuntimeException("Failed to delete ACS user", e);
        }
    }

    @Override
    public boolean isConfigured() {
        return hasConnectionString() || hasEndpointAndAccessKey();
    }

    @Override
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", isConfigured());
        if (!isConfigured()) {
            status.put("operational", false);
            status.put("provider", "azure-communication");
            status.put("error", "Set AZURE_COMMUNICATION_CONNECTION_STRING or AZURE_COMMUNICATION_ENDPOINT + AZURE_COMMUNICATION_ACCESS_KEY");
            return status;
        }
        try {
            Map<String, String> test = createUserAndToken();
            status.put("operational", true);
            status.put("provider", "azure-communication");
            status.put("lastTest", java.time.LocalDateTime.now().toString());
            try {
                deleteUser(test.get("userId"));
            } catch (Exception ignored) {
                log.warn("Failed to cleanup ACS test user {}", test.get("userId"));
            }
        } catch (Exception e) {
            status.put("operational", false);
            status.put("provider", "azure-communication");
            status.put("error", e.getMessage());
        }
        return status;
    }

    private void ensureConfigured() {
        if (!isConfigured()) {
            throw new RuntimeException("Azure Communication Services not configured");
        }
    }

    private boolean hasConnectionString() {
        return connectionString != null && !connectionString.trim().isEmpty();
    }

    private boolean hasEndpointAndAccessKey() {
        return endpoint != null && !endpoint.trim().isEmpty()
                && accessKey != null && !accessKey.trim().isEmpty();
    }
}

