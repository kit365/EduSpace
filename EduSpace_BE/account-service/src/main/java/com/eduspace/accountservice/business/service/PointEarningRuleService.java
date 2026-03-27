package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.pointrule.PointEarningRuleRequest;
import com.eduspace.accountservice.model.dto.response.pointrule.PointEarningRuleResponse;

import java.util.List;

public interface PointEarningRuleService {
    List<PointEarningRuleResponse> getAllRules();
    PointEarningRuleResponse getRuleById(Long id);
    PointEarningRuleResponse createRule(PointEarningRuleRequest request);
    PointEarningRuleResponse updateRule(Long id, PointEarningRuleRequest request);
    void deleteRule(Long id);
}
