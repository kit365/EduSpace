package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.model.dto.request.PublicUserBatchRequest;
import com.eduspace.accountservice.model.dto.request.PublicKeycloakBatchRequest;
import com.eduspace.accountservice.model.dto.request.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.UserResponse;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.presentation.constants.ApiPaths;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

        @GetMapping(ApiPaths.Account.PUBLIC_PROFILE)
        public ApiResponse<PublicUserProfileResponse> getPublicProfile(@PathVariable String userId) {
                PublicUserProfileResponse response = userService.getPublicProfileByUserId(userId);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PostMapping(ApiPaths.Account.PUBLIC_BATCH)
        public ApiResponse<List<PublicUserProfileResponse>> getPublicProfilesBatch(@RequestBody PublicUserBatchRequest request) {
                List<PublicUserProfileResponse> response = userService.getPublicProfilesByUserIds(request.getUserIds());
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(ApiPaths.Account.PUBLIC_BY_KEYCLOAK)
        public ApiResponse<PublicUserProfileResponse> getPublicByKeycloak(@PathVariable String keycloakId) {
                PublicUserProfileResponse response = userService.getPublicProfileByKeycloakId(keycloakId);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PostMapping(ApiPaths.Account.PUBLIC_BY_KEYCLOAK_BATCH)
        public ApiResponse<List<PublicUserProfileResponse>> getPublicByKeycloakBatch(@RequestBody PublicKeycloakBatchRequest request) {
                List<PublicUserProfileResponse> response = userService.getPublicProfilesByKeycloakIds(request.getKeycloakIds());
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(ApiPaths.Account.PUBLIC_SEARCH)
        public ApiResponse<List<PublicUserProfileResponse>> searchPublic(@RequestParam("query") String query,
                                                                         @RequestParam(value = "limit", defaultValue = "20") int limit) {
                List<PublicUserProfileResponse> response = userService.searchPublicProfiles(query, limit);
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
