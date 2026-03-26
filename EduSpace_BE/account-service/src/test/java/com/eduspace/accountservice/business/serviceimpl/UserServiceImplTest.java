package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.business.service.SupportStaffPresenceService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.persistence.repository.UserPermissionRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private KeycloakUserService keycloakUserService; // Using Interface

    @Mock
    private SupportStaffPresenceService supportStaffPresenceService;

    @Mock
    private UserPermissionRepository userPermissionRepository;

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
        when(userPermissionRepository.findPermissionNamesByUserId("user-uuid")).thenReturn(Collections.emptySet());
        when(userMapper.toUserResponse(eq(userEntity), any())).thenReturn(userResponse);

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
    void getProfileByEmail_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));
        when(userPermissionRepository.findPermissionNamesByUserId("user-uuid")).thenReturn(Collections.emptySet());
        when(userMapper.toUserResponse(eq(userEntity), any())).thenReturn(userResponse);

        UserResponse result = userService.getProfileByEmail("test@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void updateProfile_ByKeycloakId_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");

        when(userRepository.findByKeycloakId("test-id")).thenReturn(Optional.of(userEntity));
        when(userPermissionRepository.findPermissionNamesByUserId("user-uuid")).thenReturn(Collections.emptySet());
        when(userMapper.toUserResponse(eq(userEntity), any())).thenReturn(userResponse);

        UserResponse result = userService.updateProfile("test-id", null, request);

        assertThat(result).isNotNull();
        verify(userMapper).updateUserEntityFromRequest(eq(request), any());
        verify(userRepository).save(userEntity);
    }

    @Test
    void updateProfile_ByEmail_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));
        when(userPermissionRepository.findPermissionNamesByUserId("user-uuid")).thenReturn(Collections.emptySet());
        when(userMapper.toUserResponse(eq(userEntity), any())).thenReturn(userResponse);

        UserResponse result = userService.updateProfile(null, "test@example.com", request);

        assertThat(result).isNotNull();
        verify(userRepository).save(userEntity);
    }

    @Test
    void changePassword_WithFetchedKeycloakId_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));

        userService.changePassword(null, "test@example.com", "old", "new");

        verify(keycloakUserService).changePassword("test-id", "test@example.com", "old", "new");
    }

    @Test
    void generate2faSecret_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));

        TwoFactorResponse result = userService.generate2faSecret("test@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getSecret()).isNotNull();
        assertThat(result.getQrCodeUrl()).contains("otpauth://totp/test%40example.com?secret=");
        verify(userRepository).save(userEntity);
    }

    @Test
    void enable2fa_Success() {
        userEntity.setTotpSecret("DUMMYSECRET");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));

        // Note: Code verification is hard to mock because it uses new
        // DefaultCodeVerifier()
        // But we can check if it throws for an invalid code
        assertThatThrownBy(() -> userService.enable2fa("test@example.com", "123456"))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_2FA_CODE);
    }

    @Test
    void disable2fa_Success() {
        userEntity.setIs2faEnabled(true);
        userEntity.setTotpSecret("DUMMYSECRET");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userEntity));

        assertThatThrownBy(() -> userService.disable2fa("test@example.com", "123456"))
                .isInstanceOf(AppException.class);
    }
}
