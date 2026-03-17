package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.KeycloakUserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.admin.client.resource.UserResource;
import java.util.Optional;
import java.util.Collections;

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
    void refreshToken_Success() {
        LoginResponse mockResponse = new LoginResponse();
        when(restTemplate.postForObject(anyString(), any(), eq(LoginResponse.class))).thenReturn(mockResponse);

        LoginResponse response = keycloakUserService.refreshToken("refresh-token");

        assertThat(response).isEqualTo(mockResponse);
    }

    @Test
    void logout_Success() {
        keycloakUserService.logout("refresh-token");
        verify(restTemplate).postForLocation(anyString(), any());
    }

    @Test
    void deleteUser_Success() {
        RealmResource realmResource = mock(RealmResource.class);
        UsersResource usersResource = mock(UsersResource.class);
        UserResource userResource = mock(UserResource.class);

        when(keycloak.realm("eduspace")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get("user-id")).thenReturn(userResource);

        keycloakUserService.deleteUser("user-id");

        verify(userResource).remove();
    }

    @Test
    void findUserIdByEmail_NotFound() {
        RealmResource realmResource = mock(RealmResource.class);
        UsersResource usersResource = mock(UsersResource.class);

        when(keycloak.realm("eduspace")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.search("test@email.com", true)).thenReturn(Collections.emptyList());

        Optional<String> result = keycloakUserService.findUserIdByEmail("test@email.com");

        assertThat(result).isEmpty();
    }
}
