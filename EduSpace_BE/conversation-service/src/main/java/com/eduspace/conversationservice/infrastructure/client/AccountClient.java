package com.eduspace.conversationservice.infrastructure.client;

import com.eduspace.conversationservice.infrastructure.config.client.FeignConfig;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "account-service", configuration = FeignConfig.class)
public interface AccountClient {

    record PublicUserProfile(
            String keycloakId,
            String fullName,
            String email,
            String avatarUrl
    ) {}

    record BatchRequest(List<String> keycloakIds) {}

    @GetMapping("/api/v1/accounts/public/by-keycloak/{keycloakId}")
    ApiResponse<PublicUserProfile> getPublicProfileByKeycloakId(@PathVariable("keycloakId") String keycloakId);

    @GetMapping("/api/v1/accounts/public/by-identifier/{identifier}")
    ApiResponse<PublicUserProfile> getPublicProfileByIdentifier(@PathVariable("identifier") String identifier);

    @PostMapping("/api/v1/accounts/public/by-keycloak/batch")
    ApiResponse<List<PublicUserProfile>> getPublicProfilesByKeycloakIds(@RequestBody BatchRequest request);

    @PostMapping("/api/v1/accounts/public/by-identifier/batch")
    ApiResponse<List<PublicUserProfile>> getPublicProfilesByIdentifiers(@RequestBody BatchRequest request);
}

