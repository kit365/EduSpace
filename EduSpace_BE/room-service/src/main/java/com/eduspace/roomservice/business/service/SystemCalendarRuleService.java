package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.SystemCalendarRuleRequest;
import com.eduspace.roomservice.model.dto.response.SystemCalendarRuleResponse;
import java.util.List;

public interface SystemCalendarRuleService {

    List<SystemCalendarRuleResponse> getAll();

    SystemCalendarRuleResponse getById(Integer id);

    SystemCalendarRuleResponse create(SystemCalendarRuleRequest request);

    SystemCalendarRuleResponse update(Integer id, SystemCalendarRuleRequest request);

    void deleteById(Integer id);
}
