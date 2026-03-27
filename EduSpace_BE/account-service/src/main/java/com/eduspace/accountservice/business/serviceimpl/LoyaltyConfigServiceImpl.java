package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.LoyaltyConfigService;
import com.eduspace.accountservice.model.dto.request.loyalty.LoyaltyConfigRequest;
import com.eduspace.accountservice.model.dto.response.loyalty.LoyaltyConfigResponse;
import com.eduspace.accountservice.model.entity.LoyaltyConfigEntity;
import com.eduspace.accountservice.persistence.repository.LoyaltyConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LoyaltyConfigServiceImpl implements LoyaltyConfigService {

    private static final long CONFIG_ID = 1L;
    private static final int DEFAULT_VND_PER_POINT = 100;

    private final LoyaltyConfigRepository loyaltyConfigRepository;

    @Override
    public LoyaltyConfigResponse getConfig() {
        LoyaltyConfigEntity entity = loyaltyConfigRepository.findById(CONFIG_ID)
                .orElseGet(this::createDefaultConfig);
        return toResponse(entity);
    }

    @Override
    @Transactional
    public LoyaltyConfigResponse updateConfig(LoyaltyConfigRequest request) {
        LoyaltyConfigEntity entity = loyaltyConfigRepository.findById(CONFIG_ID)
                .orElseGet(this::createDefaultConfig);
        entity.setVndPerPoint(request.getVndPerPoint());
        entity = loyaltyConfigRepository.save(entity);
        return toResponse(entity);
    }

    private LoyaltyConfigEntity createDefaultConfig() {
        LoyaltyConfigEntity entity = LoyaltyConfigEntity.builder()
                .id(CONFIG_ID)
                .vndPerPoint(DEFAULT_VND_PER_POINT)
                .updatedAt(LocalDateTime.now())
                .build();
        return loyaltyConfigRepository.save(entity);
    }

    private LoyaltyConfigResponse toResponse(LoyaltyConfigEntity entity) {
        return LoyaltyConfigResponse.builder()
                .id(entity.getId())
                .vndPerPoint(entity.getVndPerPoint())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
