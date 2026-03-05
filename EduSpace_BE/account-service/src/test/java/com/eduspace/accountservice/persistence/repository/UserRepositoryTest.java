package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_ReturnsUser() {
        // Arrange
        UserEntity user = UserEntity.builder()
                .email("test@email.com")
                .keycloakId("sub-123")
                .fullName("Test User")
                .build();
        userRepository.save(user);

        // Act
        Optional<UserEntity> found = userRepository.findByEmail("test@email.com");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Test User");
    }
}
