package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.loyalty.LoyaltyConfigRequest;
import com.eduspace.accountservice.model.dto.response.loyalty.LoyaltyConfigResponse;

public interface LoyaltyConfigService {
    LoyaltyConfigResponse getConfig();
    LoyaltyConfigResponse updateConfig(LoyaltyConfigRequest request);
}
