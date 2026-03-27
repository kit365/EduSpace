package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.ActivityLogService;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.activity.ActivityLogResponse;
import com.eduspace.accountservice.exception.SuccessCode;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AccountPaths.BASE_PATH + AccountPaths.ADMIN + AccountPaths.ACTIVITY_LOGS)
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<PageResponse<ActivityLogResponse>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ActivityLogResponse> data = activityLogService.getAdminLogs(pageable, eventType, status, search);
        return ApiResponse.success(data, SuccessCode.USER_PROFILE_GET_SUCCESS, "Activity logs fetched successfully");
    }
}
