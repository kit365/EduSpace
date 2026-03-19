package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.reward.RewardCatalogRequest;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogResponse;
import com.eduspace.accountservice.model.dto.transaction.PointTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RewardCatalogService {
    List<RewardCatalogResponse> getAllRewards();
    RewardCatalogResponse getRewardById(Long id);
    RewardCatalogResponse createReward(RewardCatalogRequest request);
    RewardCatalogResponse updateReward(Long id, RewardCatalogRequest request);
    void deleteReward(Long id);
    
    // Additional functionality for transactions (read-only CRUD part for now)
    Page<PointTransactionResponse> getUserTransactions(String userId, Pageable pageable);
}
