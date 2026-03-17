package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.PointEarningRuleService;
import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleRequest;
import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleResponse;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.presentation.constants.PointPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(PointPaths.BASE_PATH + PointPaths.RULES)
@RequiredArgsConstructor
public class PointEarningRuleController {

    private final PointEarningRuleService pointEarningRuleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PointEarningRuleResponse>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.success(pointEarningRuleService.getAllRules()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PointEarningRuleResponse>> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pointEarningRuleService.getRuleById(id)));
    }

    @PostMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ROLE_ADMIN)
    public ResponseEntity<ApiResponse<PointEarningRuleResponse>> createRule(@Valid @RequestBody PointEarningRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(pointEarningRuleService.createRule(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ROLE_ADMIN)
    public ResponseEntity<ApiResponse<PointEarningRuleResponse>> updateRule(@PathVariable Long id, @Valid @RequestBody PointEarningRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(pointEarningRuleService.updateRule(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        pointEarningRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
