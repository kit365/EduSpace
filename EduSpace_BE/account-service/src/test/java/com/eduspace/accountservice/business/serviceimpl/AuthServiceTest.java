package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.AuthService;
import com.eduspace.accountservice.business.service.EmailService;
import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.common.enums.Role;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.auth.LoginRequest;
import com.eduspace.accountservice.model.dto.request.auth.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
import com.eduspace.accountservice.model.entity.RoleEntity;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.model.mapper.UserMapper;
import com.eduspace.accountservice.persistence.repository.RoleRepository;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private KeycloakUserService keycloakUserService; // Using Interface
    @Mock
    private UserMapper userMapper;
    @Mock
    private EmailService emailService;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthServiceImpl authServiceImpl; // Target implementation

    private AuthService authService; // Interface for calling

    @BeforeEach
    void setUp() {
        authService = authServiceImpl;
        ReflectionTestUtils.setField(authServiceImpl, "tokenExpiryHours", 24);
    }

    @Test
    void login_Success() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("password");
        
        UserEntity user = UserEntity.builder()
                .email("test@email.com")
                .isEmailVerified(true)
                .is2faEnabled(false)
                .build();

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(keycloakUserService.authenticate(anyString(), anyString(), any())).thenReturn(new LoginResponse());

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertThat(response).isNotNull();
        verify(keycloakUserService).authenticate("test@email.com", "password", null);
    }

    @Test
    void login_EmailNotVerified_ThrowsException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("password");

        UserEntity user = UserEntity.builder()
                .email("test@email.com")
                .isEmailVerified(false)
                .build();

        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EMAIL_NOT_VERIFIED);
    }

    @Test
    void register_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@email.com");
        request.setPassword("password");
        request.setFullName("Full Name");

        RoleEntity role = new RoleEntity();
        role.setId(1L);
        role.setName(Role.STUDENT.getName());

        when(userRepository.existsByEmail("test@email.com")).thenReturn(false);
        when(keycloakUserService.createUser(anyString(), anyString(), anyString())).thenReturn("keycloak-id");
        when(roleRepository.findByName(Role.STUDENT.getName())).thenReturn(Optional.of(role));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // Act
        authService.register(request);

        // Assert
        verify(userRepository).save(any(UserEntity.class));
        verify(emailService).sendVerificationEmail(eq("test@email.com"), eq("Full Name"), anyString());
    }

    @Test
    void register_UserAlreadyExists_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@email.com");

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_ALREADY_EXISTS);
    }
}
