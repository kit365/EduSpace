package com.eduspace.accountservice.infrastructure.init;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.init-admin", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final KeycloakUserService keycloakUserService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@eduspace.vn";
        String adminPassword = "admin";

        Optional<String> keycloakIdOpt;

        try {
            keycloakIdOpt = keycloakUserService.findUserIdByEmail(adminEmail);
        } catch (Exception e) {
            log.error("Failed to connect or fetch user from Keycloak during initialization", e);
            return;
        }

        String actualKeycloakId;

        if (keycloakIdOpt.isEmpty()) {
            log.info("Admin account not found in Keycloak. Initializing it now...");
            actualKeycloakId = keycloakUserService.createUser(adminEmail, "System Admin", adminPassword);
            keycloakUserService.assignRole(actualKeycloakId, "ADMIN");
            keycloakUserService.verifyEmail(actualKeycloakId);
            log.info("Successfully created Admin account in Keycloak with ID: {}", actualKeycloakId);
        } else {
            actualKeycloakId = keycloakIdOpt.get();
            log.info("Admin account already exists in Keycloak with ID: {}", actualKeycloakId);
        }

        // Sync local DB
        Optional<UserEntity> localUserOpt = userRepository.findByEmail(adminEmail);
        if (localUserOpt.isPresent()) {
            UserEntity user = localUserOpt.get();
            if (!actualKeycloakId.equals(user.getKeycloakId())) {
                log.info("Updating local DB admin Keycloak ID from '{}' to '{}'", user.getKeycloakId(),
                        actualKeycloakId);
                user.setKeycloakId(actualKeycloakId);
                userRepository.save(user);
            }
        } else {
            log.warn("Admin user not found in local DB! Did Flyway seed fail?");
        }
    }
}
