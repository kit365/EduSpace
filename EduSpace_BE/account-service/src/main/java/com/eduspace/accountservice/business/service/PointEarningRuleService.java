package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleRequest;
import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleResponse;

import java.util.List;

public interface PointEarningRuleService {
    List<PointEarningRuleResponse> getAllRules();
    PointEarningRuleResponse getRuleById(Long id);
    PointEarningRuleResponse createRule(PointEarningRuleRequest request);
    PointEarningRuleResponse updateRule(Long id, PointEarningRuleRequest request);
    void deleteRule(Long id);
}
