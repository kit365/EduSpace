package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.common.enums.ActivityLogEventType;
import com.eduspace.accountservice.common.enums.ActivityLogStatus;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.activity.ActivityLogResponse;
import org.springframework.data.domain.Pageable;

public interface ActivityLogService {

    void log(ActivityLogEventType eventType,
             ActivityLogStatus status,
             String actorUserId,
             String actorEmail,
             String message,
             String metadata);

    PageResponse<ActivityLogResponse> getAdminLogs(Pageable pageable, String eventType, String status, String search);
}
