package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.RewardCatalogService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogRequest;
import com.eduspace.accountservice.model.dto.transaction.PointTransactionResponse;
import com.eduspace.accountservice.model.dto.reward.RewardCatalogResponse;
import com.eduspace.accountservice.model.entity.RewardCatalogEntity;
import com.eduspace.accountservice.model.mapper.PointMapper;
import com.eduspace.accountservice.model.mapper.RewardMapper;
import com.eduspace.accountservice.persistence.repository.PointTransactionRepository;
import com.eduspace.accountservice.persistence.repository.RewardCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardCatalogServiceImpl implements RewardCatalogService {

    private final RewardCatalogRepository rewardCatalogRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final RewardMapper rewardMapper;
    private final PointMapper pointMapper;

    @Override
    public List<RewardCatalogResponse> getAllRewards() {
        return rewardCatalogRepository.findAll().stream()
                .map(rewardMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RewardCatalogResponse getRewardById(Long id) {
        return rewardCatalogRepository.findById(id)
                .map(rewardMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    public RewardCatalogResponse createReward(RewardCatalogRequest request) {
        RewardCatalogEntity entity = rewardMapper.toEntity(request);
        return rewardMapper.toResponse(rewardCatalogRepository.save(entity));
    }

    @Override
    @Transactional
    public RewardCatalogResponse updateReward(Long id, RewardCatalogRequest request) {
        RewardCatalogEntity entity = rewardCatalogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        rewardMapper.updateEntity(entity, request);
        return rewardMapper.toResponse(rewardCatalogRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteReward(Long id) {
        if (!rewardCatalogRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        rewardCatalogRepository.deleteById(id);
    }

    @Override
    public Page<PointTransactionResponse> getUserTransactions(String userId, Pageable pageable) {
        return pointTransactionRepository.findByUserId(userId, pageable)
                .map(pointMapper::toResponse);
    }
}
