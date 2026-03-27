package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.LoyaltyConfigService;
import com.eduspace.accountservice.model.dto.request.loyalty.LoyaltyConfigRequest;
import com.eduspace.accountservice.model.dto.response.loyalty.LoyaltyConfigResponse;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.presentation.constants.PointPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(PointPaths.BASE_PATH + PointPaths.CONFIG)
@RequiredArgsConstructor
public class LoyaltyConfigController {

    private final LoyaltyConfigService loyaltyConfigService;

    @GetMapping
    public ResponseEntity<ApiResponse<LoyaltyConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(loyaltyConfigService.getConfig()));
    }

    @PutMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ANY_ROLE_ADMIN_OR_SUPER)
    public ResponseEntity<ApiResponse<LoyaltyConfigResponse>> updateConfig(@Valid @RequestBody LoyaltyConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.success(loyaltyConfigService.updateConfig(request)));
    }
}
