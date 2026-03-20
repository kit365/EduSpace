package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.PointEarningRuleService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleRequest;
import com.eduspace.accountservice.model.dto.pointrule.PointEarningRuleResponse;
import com.eduspace.accountservice.model.entity.PointEarningRuleEntity;
import com.eduspace.accountservice.model.mapper.PointMapper;
import com.eduspace.accountservice.persistence.repository.PointEarningRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PointEarningRuleServiceImpl implements PointEarningRuleService {

    private final PointEarningRuleRepository pointEarningRuleRepository;
    private final PointMapper pointMapper;

    @Override
    public List<PointEarningRuleResponse> getAllRules() {
        return pointEarningRuleRepository.findAll().stream()
                .map(pointMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PointEarningRuleResponse getRuleById(Long id) {
        return pointEarningRuleRepository.findById(id)
                .map(pointMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    public PointEarningRuleResponse createRule(PointEarningRuleRequest request) {
        if (pointEarningRuleRepository.findByActionName(request.getActionName()).isPresent()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Could add specific ErrorCode later
        }
        PointEarningRuleEntity entity = pointMapper.toEntity(request);
        return pointMapper.toResponse(pointEarningRuleRepository.save(entity));
    }

    @Override
    @Transactional
    public PointEarningRuleResponse updateRule(Long id, PointEarningRuleRequest request) {
        PointEarningRuleEntity entity = pointEarningRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        // The check for action name uniqueness on update is removed as per the provided edit.
        // If it needs to be re-added, it should be done carefully to avoid self-collision.

        pointMapper.updateEntity(entity, request);
        return pointMapper.toResponse(pointEarningRuleRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteRule(Long id) {
        if (!pointEarningRuleRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        pointEarningRuleRepository.deleteById(id);
    }
}
