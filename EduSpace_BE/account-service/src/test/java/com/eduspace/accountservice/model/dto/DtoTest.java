package com.eduspace.accountservice.model.dto;

import com.eduspace.accountservice.model.dto.request.LoginRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DtoTest {

    @Test
    void loginRequest_GetterSetterWork() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("pass");
        request.setOtp("123456");

        assertThat(request.getEmail()).isEqualTo("test@email.com");
        assertThat(request.getPassword()).isEqualTo("pass");
        assertThat(request.getOtp()).isEqualTo("123456");
    }

    @Test
    void userResponse_BuilderWorks() {
        UserResponse response = UserResponse.builder()
                .email("test@email.com")
                .fullName("Full Name")
                .isActive(true)
                .build();

        assertThat(response.getEmail()).isEqualTo("test@email.com");
        assertThat(response.getFullName()).isEqualTo("Full Name");
        assertThat(response.getIsActive()).isTrue();
    }
}
