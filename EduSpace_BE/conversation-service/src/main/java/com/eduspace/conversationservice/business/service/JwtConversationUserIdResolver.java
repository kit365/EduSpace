package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;

@Service
public class JwtConversationUserIdResolver {
    private static final Logger log = LoggerFactory.getLogger(JwtConversationUserIdResolver.class);

    private final AccountClient accountClient;

    public JwtConversationUserIdResolver(AccountClient accountClient) {
        this.accountClient = accountClient;
    }

    public String resolveUserId(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        String sub = jwt.getSubject();
        if (sub != null && !sub.isBlank()) {
            return sub.trim();
        }
        String email = firstNonBlank(jwt.getClaimAsString("email"), jwt.getClaimAsString("preferred_username"));
        if (email == null || !email.contains("@")) {
            log.debug("JWT has no sub and no email-like claim for account lookup");
            return null;
        }
        try {
            ApiResponse<AccountClient.PublicUserProfile> response =
                    accountClient.getPublicProfileByIdentifier(email.trim());
            if (response != null && response.success() && response.data() != null) {
                String kid = response.data().keycloakId();
                if (kid != null && !kid.isBlank()) {
                    return kid.trim();
                }
            }
        } catch (Exception e) {
            log.warn("Could not resolve keycloak id from identifier {}: {}", email, e.getMessage());
        }
        return null;
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }
}
