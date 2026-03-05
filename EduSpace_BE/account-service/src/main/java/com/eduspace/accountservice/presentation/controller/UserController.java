package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.presentation.constants.ApiPaths;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Account.BASE_PATH)
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;
        private final MessageSource messageSource;

        @PostMapping(ApiPaths.Account.ME)
        public ApiResponse<UserResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
                String keycloakId = jwt.getSubject();
                UserResponse response;

                if (keycloakId != null) {
                        response = userService.getProfile(keycloakId);
                } else {
                        String email = jwt.getClaimAsString("email");
                        System.out.println("DEBUG: Keycloak sub is null, falling back to email: " + email);
                        response = userService.getProfileByEmail(email);
                }

                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PutMapping(ApiPaths.Account.ME)
        public ApiResponse<UserResponse> updateMyProfile(
                        @AuthenticationPrincipal Jwt jwt,
                        @RequestBody UpdateProfileRequest request) {
                String keycloakId = jwt.getSubject();
                String email = jwt.getClaimAsString("email");
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(),
                                LocaleContextHolder.getLocale());
                return ApiResponse.success(userService.updateProfile(keycloakId, email, request),
                                SuccessCode.USER_PROFILE_UPDATE_SUCCESS, message);
        }

        @PostMapping(ApiPaths.Account.ME + "/password")
        public ApiResponse<Void> changePassword(
                        @AuthenticationPrincipal Jwt jwt,
                        @RequestBody com.eduspace.accountservice.model.dto.request.ChangePasswordRequest request) {
                String keycloakId = jwt.getSubject();
                String email = jwt.getClaimAsString("email");
                userService.changePassword(keycloakId, email, request.getOldPassword(), request.getNewPassword());

                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(), null,
                                "Password changed successfully",
                                LocaleContextHolder.getLocale());
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, message);
        }

        @GetMapping(ApiPaths.Account.ME + "/2fa/setup")
        public ApiResponse<com.eduspace.accountservice.model.dto.response.TwoFactorResponse> setup2fa(
                        @AuthenticationPrincipal Jwt jwt) {
                String email = jwt.getClaimAsString("email");
                return ApiResponse.success(userService.generate2faSecret(email), SuccessCode.USER_PROFILE_GET_SUCCESS,
                                "TOTP setup generated");
        }

        @PostMapping(ApiPaths.Account.ME + "/2fa/enable")
        public ApiResponse<Void> enable2fa(@AuthenticationPrincipal Jwt jwt, @RequestParam String code) {
                String email = jwt.getClaimAsString("email");
                userService.enable2fa(email, code);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "2FA enabled successfully");
        }

        @PostMapping(ApiPaths.Account.ME + "/2fa/disable")
        public ApiResponse<Void> disable2fa(@AuthenticationPrincipal Jwt jwt, @RequestParam String code) {
                String email = jwt.getClaimAsString("email");
                userService.disable2fa(email, code);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "2FA disabled successfully");
        }
}
