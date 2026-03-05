package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
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
    private KeycloakUserServiceImpl keycloakUserService;

    @InjectMocks
    private UserServiceImpl userServiceImpl;

    private UserService userService;

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
        // Arrange
        when(userRepository.findByKeycloakId("test-id")).thenReturn(Optional.of(userEntity));
        when(userMapper.toUserResponse(userEntity)).thenReturn(userResponse);

        // Act
        UserResponse result = userService.getProfile("test-id");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findByKeycloakId("test-id");
    }

    @Test
    void getProfile_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByKeycloakId("none")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getProfile("none"))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    void getProfileByEmail_Success() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));
        when(userMapper.toUserResponse(userEntity)).thenReturn(userResponse);

        // Act
        UserResponse result = userService.getProfileByEmail("test@example.com");

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void updateProfile_WithKeycloakId_Success() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        when(userRepository.findByKeycloakId("test-id")).thenReturn(Optional.of(userEntity));
        when(userMapper.toUserResponse(userEntity)).thenReturn(userResponse);

        // Act
        UserResponse result = userService.updateProfile("test-id", null, request);

        // Assert
        assertThat(result).isNotNull();
        verify(userMapper).updateUserEntityFromRequest(request, userEntity);
        verify(userRepository).save(userEntity);
    }

    @Test
    void changePassword_Success() {
        // Act
        userService.changePassword("test-id", "test@example.com", "old", "new");

        // Assert
        verify(keycloakUserService).changePassword("test-id", "test@example.com", "old", "new");
    }
}
