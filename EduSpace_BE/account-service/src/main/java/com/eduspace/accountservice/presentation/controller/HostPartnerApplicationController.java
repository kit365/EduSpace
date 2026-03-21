package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.HostPartnerApplicationService;
import com.eduspace.accountservice.model.dto.request.hostapplication.RejectHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.request.hostapplication.SubmitHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.HostPartnerApplicationAdminResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.MyHostApplicationStatusResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.PendingBranchUpdateResponse;
import com.eduspace.accountservice.presentation.constants.HostPartnerApplicationPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Đơn đăng ký đối tác cho thuê
 */
@RestController
@RequestMapping(HostPartnerApplicationPaths.BASE)
@RequiredArgsConstructor
public class HostPartnerApplicationController {

    private final HostPartnerApplicationService hostPartnerApplicationService;

    @GetMapping(HostPartnerApplicationPaths.ME)
    public ApiResponse<MyHostApplicationStatusResponse> getMyApplicationStatus(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(hostPartnerApplicationService.getMyStatus(jwt));
    }

    @GetMapping(HostPartnerApplicationPaths.ME_PENDING_BRANCH_UPDATES)
    public ApiResponse<List<PendingBranchUpdateResponse>> getMyPendingBranchUpdates(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(hostPartnerApplicationService.listMyPendingBranchUpdates(jwt));
    }

    @PostMapping(HostPartnerApplicationPaths.ME)
    public ApiResponse<Void> submitMyApplication(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubmitHostPartnerApplicationRequest request) {
        hostPartnerApplicationService.submit(jwt, request);
        return ApiResponse.success(null);
    }

    @GetMapping(HostPartnerApplicationPaths.ADMIN_PENDING)
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<List<HostPartnerApplicationAdminResponse>> listPendingApplications() {
        return ApiResponse.success(hostPartnerApplicationService.listPendingForAdmin());
    }

    @PostMapping(HostPartnerApplicationPaths.ADMIN + "/{id}/approve")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<Void> approveApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        hostPartnerApplicationService.approve(id, jwt.getSubject());
        return ApiResponse.success(null);
    }

    @PostMapping(HostPartnerApplicationPaths.ADMIN + "/{id}/reject")
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ApiResponse<Void> rejectApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) RejectHostPartnerApplicationRequest body) {
        hostPartnerApplicationService.reject(
                id,
                jwt.getSubject(),
                body != null ? body : new RejectHostPartnerApplicationRequest());
        return ApiResponse.success(null);
    }
}
