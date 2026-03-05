package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.LoginRequest;
import com.eduspace.accountservice.model.dto.response.LoginResponse;
import com.eduspace.accountservice.model.dto.request.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserResponse register(RegisterRequest request);

    void verifyEmail(String token);

    LoginResponse refreshToken(String refreshToken);

    void logout(String refreshToken);
}
