package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.loyalty.LoyaltyConfigRequest;
import com.eduspace.accountservice.model.dto.loyalty.LoyaltyConfigResponse;

public interface LoyaltyConfigService {
    LoyaltyConfigResponse getConfig();
    LoyaltyConfigResponse updateConfig(LoyaltyConfigRequest request);
}
