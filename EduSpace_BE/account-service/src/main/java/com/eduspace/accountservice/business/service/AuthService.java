package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.auth.LoginRequest;
import com.eduspace.accountservice.model.dto.request.auth.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserResponse register(RegisterRequest request);

    void verifyEmail(String token);

    LoginResponse refreshToken(String refreshToken);

    void logout(String refreshToken);
}
