package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.MessageSource;
import org.springframework.context.MessageSource;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private MessageSource messageSource;

    @Test
    void getMyProfile_Success() throws Exception {
        // Arrange
        UserResponse response = UserResponse.builder()
                .email("test@email.com")
                .fullName("Test User")
                .build();

        when(userService.getProfile(anyString())).thenReturn(response);
        when(messageSource.getMessage(anyString(), any(), anyString(), any())).thenReturn("Success");

        // Act & Assert
        mockMvc.perform(post("/api/v1/account/me")
                .with(jwt().jwt(j -> j.subject("test-sub"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@email.com"));
    }
}
