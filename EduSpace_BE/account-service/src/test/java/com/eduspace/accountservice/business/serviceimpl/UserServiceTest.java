package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private KeycloakUserService keycloakUserService; // Using Interface

    @InjectMocks
    private UserServiceImpl userServiceImpl; // Target implementation

    private UserService userService; // Interface for calling

    private UserEntity userEntity;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        userService = userServiceImpl;
        userEntity = UserEntity.builder()
                .id("user-uuid")
                .keycloakId("test-id")
                .email("test@example.com")
                .fullName("Test User")
                .build();

        userResponse = UserResponse.builder()
                .email("test@example.com")
                .fullName("Test User")
                .build();
    }

    @Test
    void getProfile_Success() {
        // Arrange: Prepare data and mock behavior
        when(userRepository.findByKeycloakId("test-id")).thenReturn(Optional.of(userEntity));
        when(userMapper.toUserResponse(userEntity)).thenReturn(userResponse);

        // Act: Execute method
        UserResponse result = userService.getProfile("test-id");

        // Assert: Verify results
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findByKeycloakId("test-id");
    }

    @Test
    void getProfile_UserNotFound_ThrowsException() {
        // Arrange: Mock empty repository response
        when(userRepository.findByKeycloakId("none")).thenReturn(Optional.empty());

        // Act & Assert: Execute and verify exception
        assertThatThrownBy(() -> userService.getProfile("none"))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    void changePassword_Success() {
        // Act: Execute change password
        userService.changePassword("test-id", "test@example.com", "old", "new");

        // Assert: Verify interaction with Keycloak service
        verify(keycloakUserService).changePassword("test-id", "test@example.com", "old", "new");
    }
}
