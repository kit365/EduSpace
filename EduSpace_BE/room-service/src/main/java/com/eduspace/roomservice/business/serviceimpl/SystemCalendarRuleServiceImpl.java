package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.SystemCalendarRuleService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.SystemCalendarRuleRequest;
import com.eduspace.roomservice.model.dto.response.SystemCalendarRuleResponse;
import com.eduspace.roomservice.model.entity.SystemCalendarRuleEntity;
import com.eduspace.roomservice.model.mapper.SystemCalendarRuleMapper;
import com.eduspace.roomservice.persistence.repository.SystemCalendarRuleRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemCalendarRuleServiceImpl implements SystemCalendarRuleService {

    private final SystemCalendarRuleRepository systemCalendarRuleRepository;
    private final SystemCalendarRuleMapper systemCalendarRuleMapper;

    @Override
    public List<SystemCalendarRuleResponse> getAll() {
        return systemCalendarRuleMapper.toResponseList(systemCalendarRuleRepository.findAll());
    }

    @Override
    public SystemCalendarRuleResponse getById(Integer id) {
        SystemCalendarRuleEntity entity = systemCalendarRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CALENDAR_RULE_NOT_FOUND));
        return systemCalendarRuleMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public SystemCalendarRuleResponse create(SystemCalendarRuleRequest request) {
        SystemCalendarRuleEntity entity = systemCalendarRuleMapper.toEntity(request);
        return systemCalendarRuleMapper.toResponse(systemCalendarRuleRepository.save(entity));
    }

    @Override
    @Transactional
    public SystemCalendarRuleResponse update(Integer id, SystemCalendarRuleRequest request) {
        SystemCalendarRuleEntity existing = systemCalendarRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CALENDAR_RULE_NOT_FOUND));
        systemCalendarRuleMapper.updateEntity(request, existing);
        return systemCalendarRuleMapper.toResponse(systemCalendarRuleRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!systemCalendarRuleRepository.existsById(id)) throw new AppException(ErrorCode.SYSTEM_CALENDAR_RULE_NOT_FOUND);
        systemCalendarRuleRepository.deleteById(id);
    }
}
