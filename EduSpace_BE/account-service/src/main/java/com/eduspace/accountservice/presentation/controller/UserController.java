package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.model.dto.request.user.ChangePasswordRequest;
import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.presentation.constants.AccountPaths;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping(AccountPaths.BASE_PATH)
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;
        private final MessageSource messageSource;

        @GetMapping(AccountPaths.ME)
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

        @PutMapping(AccountPaths.ME)
        public ApiResponse<UserResponse> updateMyProfile(
                        @AuthenticationPrincipal Jwt jwt,
                        @RequestBody UpdateProfileRequest request) {
                String keycloakId = jwt.getSubject();
                String email = jwt.getClaimAsString("email");
                
                UserResponse response;
                if (keycloakId != null) {
                    response = userService.updateProfile(keycloakId, null, request);
                } else {
                    response = userService.updateProfile(null, email, request);
                }

                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(),
                                LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, message);
        }

        @PostMapping(AccountPaths.ME + AccountPaths.PASSWORD)
        public ApiResponse<Void> changePassword(
                        @AuthenticationPrincipal Jwt jwt,
                        @RequestBody ChangePasswordRequest request) {
                String keycloakId = jwt.getSubject();
                String email = jwt.getClaimAsString("email");
                userService.changePassword(keycloakId, email, request.getOldPassword(), request.getNewPassword());

                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_UPDATE_SUCCESS.getMessageKey(), null,
                                "Password changed successfully",
                                LocaleContextHolder.getLocale());
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, message);
        }

        @GetMapping(AccountPaths.ME + AccountPaths.TWO_FA_SETUP)
        public ApiResponse<TwoFactorResponse> setup2fa(
                        @AuthenticationPrincipal Jwt jwt) {
                String email = jwt.getClaimAsString("email");
                return ApiResponse.success(userService.generate2faSecret(email), SuccessCode.USER_PROFILE_GET_SUCCESS,
                                "TOTP setup generated");
        }

        @PostMapping(AccountPaths.ME + AccountPaths.TWO_FA_ENABLE)
        public ApiResponse<Void> enable2fa(@AuthenticationPrincipal Jwt jwt, @RequestParam String code) {
                String email = jwt.getClaimAsString("email");
                userService.enable2fa(email, code);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "2FA enabled successfully");
        }

        @PostMapping(AccountPaths.ME + AccountPaths.TWO_FA_DISABLE)
        public ApiResponse<Void> disable2fa(@AuthenticationPrincipal Jwt jwt, @RequestParam String code) {
                String email = jwt.getClaimAsString("email");
                userService.disable2fa(email, code);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "2FA disabled successfully");
        }

        @GetMapping(AccountPaths.ADMIN + AccountPaths.USERS)
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ApiResponse<PageResponse<UserResponse>> getAllUsers(
                        @AuthenticationPrincipal Jwt jwt,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String role,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) String kyc) {
                String requesterKeycloakId = jwt.getSubject();
                String requesterEmail = jwt.getClaimAsString("email");
                
                Pageable pageable = PageRequest.of(page, size);
                
                String identifier = requesterKeycloakId != null ? requesterKeycloakId : requesterEmail;
                boolean isEmail = requesterKeycloakId == null;
                List<String> roles = (role == null || role.isBlank())
                        ? List.of()
                        : Arrays.stream(role.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();

                PageResponse<UserResponse> response = userService.getAllUsers(pageable, search, roles, status, kyc,
                                identifier, isEmail);
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, "Users fetched successfully");
        }
}
