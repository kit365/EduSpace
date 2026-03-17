package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.model.dto.request.auth.LoginRequest;
import com.eduspace.accountservice.model.dto.request.auth.RefreshTokenRequest;
import com.eduspace.accountservice.model.dto.request.auth.RegisterRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.auth.LoginResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.business.service.AuthService;
import com.eduspace.accountservice.presentation.constants.AuthPaths;
import com.eduspace.accountservice.exception.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AuthPaths.BASE_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MessageSource messageSource;

    @PostMapping(AuthPaths.VERIFY_EMAIL)
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        String message = messageSource.getMessage(SuccessCode.EMAIL_VERIFY_SUCCESS.getMessageKey(), null,
                SuccessCode.EMAIL_VERIFY_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
        return ApiResponse.success(null, SuccessCode.EMAIL_VERIFY_SUCCESS, message);
    }

    @PostMapping(AuthPaths.LOGIN)
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        String message = messageSource.getMessage(SuccessCode.USER_LOGIN_SUCCESS.getMessageKey(), null,
                SuccessCode.USER_LOGIN_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
        return ApiResponse.success(response, SuccessCode.USER_LOGIN_SUCCESS, message);
    }

    @PostMapping(AuthPaths.REGISTER)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        String message = messageSource.getMessage(SuccessCode.USER_REGISTER_SUCCESS.getMessageKey(), null,
                SuccessCode.USER_REGISTER_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
        return ApiResponse.success(null, SuccessCode.USER_REGISTER_SUCCESS, message);
    }

    @PostMapping(AuthPaths.REFRESH)
    public ApiResponse<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return ApiResponse.success(response, SuccessCode.USER_LOGIN_SUCCESS, "Token refreshed");
    }

    @PostMapping(AuthPaths.LOGOUT)
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ApiResponse.success(null, SuccessCode.USER_LOGOUT_SUCCESS, "Logged out");
    }
}
