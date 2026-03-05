package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.MessageSource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private MessageSource messageSource;

    @BeforeEach
    void setUp() {
        when(messageSource.getMessage(anyString(), any(), anyString(), any())).thenReturn("Success");
    }

    @Test
    void getMyProfile_Success() throws Exception {
        // Arrange
        UserResponse response = UserResponse.builder()
                .email("test@email.com")
                .fullName("Test User")
                .build();

        when(userService.getProfile(anyString())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get(com.eduspace.accountservice.presentation.constants.ApiPaths.Account.BASE_PATH
                + com.eduspace.accountservice.presentation.constants.ApiPaths.Account.ME)
                .with(jwt().jwt(j -> j.subject("test-sub"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@email.com"));
    }

    @Test
    void getMyProfile_NotFound_ReturnsError() throws Exception {
        // Arrange
        when(userService.getProfile(anyString())).thenThrow(new AppException(ErrorCode.USER_NOT_FOUND));

        // Act & Assert
        mockMvc.perform(get(com.eduspace.accountservice.presentation.constants.ApiPaths.Account.BASE_PATH
                + com.eduspace.accountservice.presentation.constants.ApiPaths.Account.ME)
                .with(jwt().jwt(j -> j.subject("unknown-sub"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getMyProfile_FallbackToEmail_Success() throws Exception {
        UserResponse response = UserResponse.builder()
                .email("test@email.com")
                .build();

        when(userService.getProfileByEmail(anyString())).thenReturn(response);
        when(userService.getProfile(anyString())).thenReturn(response);

        mockMvc.perform(get(com.eduspace.accountservice.presentation.constants.ApiPaths.Account.BASE_PATH
                + com.eduspace.accountservice.presentation.constants.ApiPaths.Account.ME)
                .with(jwt().jwt(j -> j.claim("email", "test@email.com")))) // No subject
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@email.com"));
    }

    @Test
    void updateMyProfile_Success() throws Exception {
        UserResponse response = UserResponse.builder().email("test@email.com").build();
        when(userService.updateProfile(any(), any(), any())).thenReturn(response);

        mockMvc.perform(put(com.eduspace.accountservice.presentation.constants.ApiPaths.Account.BASE_PATH
                + com.eduspace.accountservice.presentation.constants.ApiPaths.Account.ME)
                .contentType("application/json")
                .content("{\"fullName\":\"Updated Name\"}")
                .with(jwt().jwt(j -> j.subject("test-sub").claim("email", "test@email.com"))))
                .andExpect(status().isOk());
    }

    @Test
    void enable2fa_Success() throws Exception {
        mockMvc.perform(post(com.eduspace.accountservice.presentation.constants.ApiPaths.Account.BASE_PATH
                + com.eduspace.accountservice.presentation.constants.ApiPaths.Account.ME + "/2fa/enable")
                .param("code", "123456")
                .with(jwt().jwt(j -> j.claim("email", "test@email.com"))))
                .andExpect(status().isOk());
    }
}
