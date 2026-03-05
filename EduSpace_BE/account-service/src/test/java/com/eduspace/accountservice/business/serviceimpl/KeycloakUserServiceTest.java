package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.model.dto.response.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KeycloakUserServiceImplTest {

    @Mock
    private Keycloak keycloak;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private KeycloakUserServiceImpl keycloakUserServiceImpl;

    private KeycloakUserService keycloakUserService;

    @BeforeEach
    void setUp() {
        keycloakUserService = keycloakUserServiceImpl;
        ReflectionTestUtils.setField(keycloakUserServiceImpl, "serverUrl", "http://keycloak:8080");
        ReflectionTestUtils.setField(keycloakUserServiceImpl, "realm", "eduspace");
        ReflectionTestUtils.setField(keycloakUserServiceImpl, "clientId", "eduspace-client");
        ReflectionTestUtils.setField(keycloakUserServiceImpl, "clientSecret", "secret");
    }

    @Test
    void authenticate_Success() {
        // Arrange
        LoginResponse mockResponse = new LoginResponse();
        when(restTemplate.postForObject(anyString(), any(), eq(LoginResponse.class))).thenReturn(mockResponse);

        // Act
        LoginResponse response = keycloakUserService.authenticate("test@email.com", "password", null);

        // Assert
        assertThat(response).isEqualTo(mockResponse);
        verify(restTemplate).postForObject(contains("/token"), any(), eq(LoginResponse.class));
    }

    @Test
    void authenticate_Failure_ThrowsAppException() {
        // Arrange
        when(restTemplate.postForObject(anyString(), any(), eq(LoginResponse.class)))
                .thenThrow(new RuntimeException("API error"));

        // Act & Assert
        assertThatThrownBy(() -> keycloakUserService.authenticate("test@email.com", "password", null))
                .isInstanceOf(AppException.class);
    }
}
