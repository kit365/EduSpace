package com.eduspace.accountservice.infrastructure.init;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.Role;
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
        // Initialize default System Admin
        initializeAdminAccount("admin@eduspace.vn", "System Admin", "admin", Role.ADMIN.getName());

        // Initialize User's Super Admin
        initializeAdminAccount("kietops365@gmail.com", "Kiet Super Admin", "1", Role.SUPER_ADMIN.getName());
    }

    private void initializeAdminAccount(String email, String fullName, String password, String roleName) {
        Optional<String> keycloakIdOpt;

        try {
            keycloakIdOpt = keycloakUserService.findUserIdByEmail(email);
        } catch (Exception e) {
            log.error("Failed to connect or fetch user from Keycloak during initialization for {}", email, e);
            return;
        }

        String actualKeycloakId;

        if (keycloakIdOpt.isEmpty()) {
            log.info("Account {} not found in Keycloak. Initializing it now...", email);
            try {
                actualKeycloakId = keycloakUserService.createUser(email, fullName, password);
                log.info("Successfully created {} account in Keycloak with ID: {}", email, actualKeycloakId);
            } catch (Exception e) {
                log.error("Failed to create {} account in Keycloak", email, e);
                return;
            }
        } else {
            actualKeycloakId = keycloakIdOpt.get();
            log.info("Account {} already exists in Keycloak with ID: {}", email, actualKeycloakId);
        }

        // Always ensure role is assigned
        try {
            keycloakUserService.assignRole(actualKeycloakId, roleName);
            keycloakUserService.verifyEmail(actualKeycloakId);
        } catch (Exception e) {
            log.warn("Failed to ensure role {}/verified for {}", roleName, email);
        }

        // Sync local DB
        Optional<UserEntity> localUserOpt = userRepository.findByEmail(email);
        if (localUserOpt.isPresent()) {
            UserEntity user = localUserOpt.get();
            if (!actualKeycloakId.equals(user.getKeycloakId())) {
                log.info("Updating local DB admin Keycloak ID for {} from '{}' to '{}'", 
                        email, user.getKeycloakId(), actualKeycloakId);
                user.setKeycloakId(actualKeycloakId);
                userRepository.save(user);
            }
        } else {
            log.warn("User {} not found in local DB! Ensure Flyway migration V1__init_schema.sql is correct.", email);
        }
    }
}
