package com.eduspace.accountservice.model.dto;

import com.eduspace.accountservice.model.dto.request.LoginRequest;
import com.eduspace.accountservice.model.dto.request.RegisterRequest;
import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DtoTest {

    @Test
    void loginRequest_Works() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("pass");
        assertThat(request.getEmail()).isEqualTo("test@email.com");
    }

    @Test
    void registerRequest_Works() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@email.com");
        request.setFullName("Full Name");
        assertThat(request.getFullName()).isEqualTo("Full Name");
    }

    @Test
    void updateProfileRequest_Works() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setPhoneNumber("123456");
        assertThat(request.getPhoneNumber()).isEqualTo("123456");
    }

    @Test
    void userResponse_Works() {
        UserResponse response = UserResponse.builder()
                .email("test@email.com")
                .isActive(true)
                .build();
        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getIsActive()).isTrue();
    }
}
