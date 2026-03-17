package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.RewardCatalogService;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogRequest;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogResponse;
import com.eduspace.accountservice.model.dto.transaction.PointTransactionResponse;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.presentation.constants.RewardPaths;
import com.eduspace.accountservice.presentation.constants.PreAuthorizeConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(RewardPaths.BASE_PATH)
@RequiredArgsConstructor
public class RewardCatalogController {

    private final RewardCatalogService rewardCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RewardCatalogResponse>>> getAllRewards() {
        return ResponseEntity.ok(ApiResponse.success(rewardCatalogService.getAllRewards()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RewardCatalogResponse>> getRewardById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(rewardCatalogService.getRewardById(id)));
    }

    @PostMapping
    @PreAuthorize(PreAuthorizeConstants.HAS_ROLE_ADMIN)
    public ResponseEntity<ApiResponse<RewardCatalogResponse>> createReward(@Valid @RequestBody RewardCatalogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(rewardCatalogService.createReward(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize(PreAuthorizeConstants.HAS_ROLE_ADMIN)
    public ResponseEntity<ApiResponse<RewardCatalogResponse>> updateReward(@PathVariable Long id, @Valid @RequestBody RewardCatalogRequest request) {
        return ResponseEntity.ok(ApiResponse.success(rewardCatalogService.updateReward(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReward(@PathVariable Long id) {
        rewardCatalogService.deleteReward(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping(RewardPaths.TRANSACTIONS)
    public ResponseEntity<ApiResponse<Page<PointTransactionResponse>>> getUserTransactions(
            @PathVariable String userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(rewardCatalogService.getUserTransactions(userId, pageable)));
    }
}
