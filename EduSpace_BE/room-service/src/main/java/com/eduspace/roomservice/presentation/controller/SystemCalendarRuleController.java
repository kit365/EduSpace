package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.SystemCalendarRuleService;
import com.eduspace.roomservice.model.dto.request.SystemCalendarRuleRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.SystemCalendarRuleResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.SystemCalendarRules.BASE_PATH)
@RequiredArgsConstructor
public class SystemCalendarRuleController {

    private final SystemCalendarRuleService systemCalendarRuleService;

    @GetMapping
    public ApiResponse<List<SystemCalendarRuleResponse>> getAll() {
        return ApiResponse.success(systemCalendarRuleService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<SystemCalendarRuleResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(systemCalendarRuleService.getById(id));
    }

    @PostMapping
    public ApiResponse<SystemCalendarRuleResponse> create(@RequestBody SystemCalendarRuleRequest request) {
        return ApiResponse.success(systemCalendarRuleService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SystemCalendarRuleResponse> update(
            @PathVariable Integer id,
            @RequestBody SystemCalendarRuleRequest request) {
        return ApiResponse.success(systemCalendarRuleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        systemCalendarRuleService.deleteById(id);
        return ApiResponse.success(null);
    }
}
