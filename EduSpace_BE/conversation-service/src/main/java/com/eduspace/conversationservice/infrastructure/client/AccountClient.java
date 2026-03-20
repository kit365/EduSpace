package com.eduspace.conversationservice.infrastructure.client;

import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Objects;

@Component
public class AccountClient {

    public record PublicUserProfile(
            String keycloakId,
            String fullName,
            String email,
            String avatarUrl
    ) {
    }

    private final RestClient restClient;

    public AccountClient(
            RestClient.Builder builder,
            @Value("${app.clients.account.base-url:http://ACCOUNT-SERVICE}") String baseUrl
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public PublicUserProfile getPublicProfileByKeycloakId(String keycloakId, String bearerToken) {
        ApiResponse<PublicUserProfile> response = restClient.get()
                .uri("/api/v1/accounts/public/by-keycloak/{keycloakId}", keycloakId)
                .header("Authorization", "Bearer " + bearerToken)
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<>() {
                });
        if (response == null || !response.success() || response.data() == null) {
            return null;
        }
        return response.data();
    }

    public List<PublicUserProfile> getPublicProfilesByKeycloakIds(List<String> keycloakIds, String bearerToken) {
        if (keycloakIds == null || keycloakIds.isEmpty()) return List.of();

        ApiResponse<List<PublicUserProfile>> response = restClient.post()
                .uri("/api/v1/accounts/public/by-keycloak/batch")
                .header("Authorization", "Bearer " + bearerToken)
                .body(new BatchRequest(keycloakIds))
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<>() {
                });

        if (response == null || !response.success() || response.data() == null) {
            return List.of();
        }
        return Objects.requireNonNullElse(response.data(), List.of());
    }

    public record BatchRequest(List<String> keycloakIds) {
    }
}

