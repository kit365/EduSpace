package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.model.dto.request.hoststaff.InviteBranchManagerRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.ReplaceStaffPermissionsRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.UpdateManagerPermissionsRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostStaffMemberResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostManagerScopeResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.InviteBranchManagerResult;
import com.eduspace.accountservice.model.entity.UserEntity;
import com.eduspace.accountservice.business.service.HostStaffService;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import com.eduspace.accountservice.persistence.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.HOST + "/staff")
@RequiredArgsConstructor
public class HostStaffController {

    private final HostStaffService hostStaffService;
    private final UserRepository userRepository;
    private final MessageSource messageSource;

    private UserEntity resolveCurrentUser(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (StringUtils.hasText(email)) {
            return userRepository.findByEmail(email.trim())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
        String sub = jwt.getSubject();
        if (!StringUtils.hasText(sub)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return userRepository.findByKeycloakId(sub)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ApiResponse<List<HostStaffMemberResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        UserEntity host = resolveCurrentUser(jwt);
        return ApiResponse.success(hostStaffService.listStaff(host.getId()));
    }

    @GetMapping("/me/scope")
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ApiResponse<HostManagerScopeResponse> getMyScope(@AuthenticationPrincipal Jwt jwt) {
        UserEntity current = resolveCurrentUser(jwt);
        return ApiResponse.success(hostStaffService.getManagerScope(current.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ResponseEntity<ApiResponse<InviteBranchManagerResult>> inviteBranchManager(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InviteBranchManagerRequest request) {
        UserEntity host = resolveCurrentUser(jwt);
        InviteBranchManagerResult result = hostStaffService.inviteBranchManager(host.getId(), request);
        if (result.isCreated()) {
            String msg = messageSource.getMessage(
                    SuccessCode.HOST_MANAGER_CREATED_SUCCESS.getMessageKey(),
                    null,
                    "Đã tạo tài khoản và gửi email mời quản lý thành công",
                    LocaleContextHolder.getLocale());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(result, SuccessCode.HOST_MANAGER_CREATED_SUCCESS, msg));
        }
        String msg = messageSource.getMessage(
                SuccessCode.HOST_MANAGER_GRANTED_SUCCESS.getMessageKey(),
                null,
                "Đã cấp quyền quản lý thành công",
                LocaleContextHolder.getLocale());
        return ResponseEntity.ok(ApiResponse.success(result, SuccessCode.HOST_MANAGER_GRANTED_SUCCESS, msg));
    }

    @PutMapping("/{staffUserId}/permissions")
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ApiResponse<HostStaffMemberResponse> replacePermissions(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String staffUserId,
            @Valid @RequestBody ReplaceStaffPermissionsRequest request) {
        UserEntity host = resolveCurrentUser(jwt);
        return ApiResponse.success(hostStaffService.replacePermissions(host.getId(), staffUserId, request));
    }

    @PutMapping("/{staffUserId}/manager-permissions")
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ApiResponse<HostStaffMemberResponse> updateManagerPermissions(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String staffUserId,
            @Valid @RequestBody UpdateManagerPermissionsRequest request) {
        UserEntity host = resolveCurrentUser(jwt);
        return ApiResponse.success(hostStaffService.updateManagerPermissions(host.getId(), staffUserId, request));
    }

    @DeleteMapping("/{staffUserId}")
    @PreAuthorize("hasAnyRole('HOST','MANAGER')")
    public ApiResponse<Void> remove(@AuthenticationPrincipal Jwt jwt, @PathVariable String staffUserId) {
        UserEntity host = resolveCurrentUser(jwt);
        hostStaffService.removeStaff(host.getId(), staffUserId);
        return ApiResponse.success(null);
    }
}
