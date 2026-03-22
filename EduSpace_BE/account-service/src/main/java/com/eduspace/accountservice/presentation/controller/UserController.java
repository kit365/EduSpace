package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.PublicUserBatchRequest;
import com.eduspace.accountservice.model.dto.request.PublicKeycloakBatchRequest;
import com.eduspace.accountservice.model.dto.request.user.ChangePasswordRequest;
import com.eduspace.accountservice.model.dto.request.user.UpdateProfileRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.PublicUserProfileResponse;
import com.eduspace.accountservice.model.dto.response.user.TwoFactorResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.user.UserResponse;
import com.eduspace.accountservice.business.service.SupportStaffPresenceService;
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;

import org.springframework.util.StringUtils;
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
        private final SupportStaffPresenceService supportStaffPresenceService;
        private final MessageSource messageSource;

        @GetMapping(AccountPaths.ME)
        public ApiResponse<UserResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
                String keycloakId = jwt.getSubject();
                UserResponse response;

                String email = jwt.getClaimAsString("email");
                String preferredUsername = jwt.getClaimAsString("preferred_username");
                String username = jwt.getClaimAsString("username");

                String candidateEmail = StringUtils.hasText(email)
                        ? email
                        : (StringUtils.hasText(preferredUsername) ? preferredUsername : username);

                if (StringUtils.hasText(candidateEmail)) {
                        response = userService.getProfileByEmail(candidateEmail.trim());
                } else if (keycloakId != null) {
                        response = userService.getProfile(keycloakId);
                } else {
                        throw new AppException(ErrorCode.USER_NOT_FOUND);
                }

                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(AccountPaths.PUBLIC_PROFILE)
        public ApiResponse<PublicUserProfileResponse> getPublicProfile(@PathVariable String userId) {
                PublicUserProfileResponse response = userService.getPublicProfileByUserId(userId);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PostMapping(AccountPaths.PUBLIC_BATCH)
        public ApiResponse<List<PublicUserProfileResponse>> getPublicProfilesBatch(@RequestBody PublicUserBatchRequest request) {
                List<PublicUserProfileResponse> response = userService.getPublicProfilesByUserIds(request.getUserIds());
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(AccountPaths.PUBLIC_BY_KEYCLOAK)
        public ApiResponse<PublicUserProfileResponse> getPublicByKeycloak(@PathVariable String keycloakId) {
                PublicUserProfileResponse response = userService.getPublicProfileByKeycloakId(keycloakId);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(AccountPaths.PUBLIC_BY_IDENTIFIER)
        public ApiResponse<PublicUserProfileResponse> getPublicByIdentifier(@PathVariable String identifier) {
                PublicUserProfileResponse response = userService.getPublicProfileByIdentifier(identifier);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PostMapping(AccountPaths.PUBLIC_BY_KEYCLOAK_BATCH)
        public ApiResponse<List<PublicUserProfileResponse>> getPublicByKeycloakBatch(@RequestBody PublicKeycloakBatchRequest request) {
                List<PublicUserProfileResponse> response = userService.getPublicProfilesByKeycloakIds(request.getKeycloakIds());
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @PostMapping(AccountPaths.PUBLIC_BY_IDENTIFIER_BATCH)
        public ApiResponse<List<PublicUserProfileResponse>> getPublicByIdentifierBatch(@RequestBody PublicKeycloakBatchRequest request) {
                List<PublicUserProfileResponse> response = userService.getPublicProfilesByIdentifiers(request.getKeycloakIds());
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(AccountPaths.PUBLIC_SEARCH)
        public ApiResponse<List<PublicUserProfileResponse>> searchPublic(@RequestParam("query") String query,
                                                                         @RequestParam(value = "limit", defaultValue = "20") int limit) {
                List<PublicUserProfileResponse> response = userService.searchPublicProfiles(query, limit);
                String message = messageSource.getMessage(SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), null,
                                SuccessCode.USER_PROFILE_GET_SUCCESS.getMessageKey(), LocaleContextHolder.getLocale());
                return ApiResponse.success(response, SuccessCode.USER_PROFILE_GET_SUCCESS, message);
        }

        @GetMapping(AccountPaths.PUBLIC_SUPPORT_ELIGIBLE_STAFF_COUNT)
        public ApiResponse<Long> getEligibleSupportStaffCount() {
                long count = userService.countEligibleSupportStaff();
                return ApiResponse.success(count, SuccessCode.USER_PROFILE_GET_SUCCESS,
                                "Eligible support staff count");
        }

        @GetMapping(AccountPaths.PUBLIC_SUPPORT_ONLINE_STAFF_COUNT)
        public ApiResponse<Long> getOnlineSupportStaffCount() {
                long count = supportStaffPresenceService.countOnline();
                return ApiResponse.success(count, SuccessCode.USER_PROFILE_GET_SUCCESS,
                                "Online support staff count");
        }
 
        @GetMapping(AccountPaths.PUBLIC_SUPPORT_ONLINE_STAFF_LIST)
        public ApiResponse<List<PublicUserProfileResponse>> getOnlineSupportStaffProfiles() {
                List<PublicUserProfileResponse> profiles = userService.getOnlineSupportStaffProfiles();
                return ApiResponse.success(profiles, SuccessCode.USER_PROFILE_GET_SUCCESS,
                                "Online support staff profiles");
        }

        @PostMapping(AccountPaths.ME_SUPPORT_PRESENCE)
        @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
        public ApiResponse<Void> recordSupportPresence(@AuthenticationPrincipal Jwt jwt) {
                String keycloakId = jwt.getSubject();
                supportStaffPresenceService.recordPresence(keycloakId);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS,
                                "Support presence recorded");
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

        @PostMapping(AccountPaths.ADMIN + AccountPaths.USERS + "/{userId}/kyc/approve")
        @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
        public ApiResponse<Void> approveUserKyc(@PathVariable String userId) {
                userService.approveUserKyc(userId);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "User KYC approved");
        }

        @PostMapping(AccountPaths.ADMIN + AccountPaths.USERS + "/{userId}/kyc/reject")
        @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
        public ApiResponse<Void> rejectUserKyc(@PathVariable String userId,
                        @RequestParam(required = false) String reason) {
                userService.rejectUserKyc(userId, reason);
                return ApiResponse.success(null, SuccessCode.USER_PROFILE_UPDATE_SUCCESS, "User KYC rejected");
        }
}
