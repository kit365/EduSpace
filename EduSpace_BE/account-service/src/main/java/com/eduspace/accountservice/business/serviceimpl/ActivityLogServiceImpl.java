package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.ActivityLogService;
import com.eduspace.accountservice.common.enums.ActivityLogEventType;
import com.eduspace.accountservice.common.enums.ActivityLogStatus;
import com.eduspace.accountservice.model.dto.response.PageResponse;
import com.eduspace.accountservice.model.dto.response.activity.ActivityLogResponse;
import com.eduspace.accountservice.model.entity.ActivityLogEntity;
import com.eduspace.accountservice.persistence.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(ActivityLogEventType eventType,
                    ActivityLogStatus status,
                    String actorUserId,
                    String actorEmail,
                    String message,
                    String metadata) {
        HttpServletRequest request = resolveCurrentRequest();
        ActivityLogEntity entity = ActivityLogEntity.builder()
                .eventType(eventType)
                .status(status)
                .actorUserId(actorUserId)
                .actorEmail(actorEmail)
                .message(message)
                .ipAddress(resolveClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .metadata(metadata)
                .build();
        activityLogRepository.save(entity);
    }

    @Override
    public PageResponse<ActivityLogResponse> getAdminLogs(Pageable pageable, String eventType, String status, String search) {
        Pageable sorted = pageable.getSort().isSorted()
                ? pageable
                : Pageable.ofSize(pageable.getPageSize()).withPage(pageable.getPageNumber()).withSort(Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<ActivityLogEntity> spec = Specification.where(withEventType(eventType))
                .and(withStatus(status))
                .and(withSearch(search));

        Page<ActivityLogEntity> page = activityLogRepository.findAll(spec, sorted);
        return PageResponse.<ActivityLogResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private ActivityLogResponse toResponse(ActivityLogEntity entity) {
        return ActivityLogResponse.builder()
                .id(entity.getId())
                .eventType(entity.getEventType())
                .status(entity.getStatus())
                .actorUserId(entity.getActorUserId())
                .actorEmail(entity.getActorEmail())
                .message(entity.getMessage())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private Specification<ActivityLogEntity> withEventType(String eventType) {
        if (!StringUtils.hasText(eventType)) {
            return null;
        }
        try {
            String normalized = eventType.trim().toUpperCase(Locale.ROOT);
            ActivityLogEventType parsed = ActivityLogEventType.valueOf(normalized);
            return (root, query, cb) -> cb.equal(root.get("eventType"), parsed);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Specification<ActivityLogEntity> withStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        try {
            String normalized = status.trim().toUpperCase(Locale.ROOT);
            ActivityLogStatus parsed = ActivityLogStatus.valueOf(normalized);
            return (root, query, cb) -> cb.equal(root.get("status"), parsed);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Specification<ActivityLogEntity> withSearch(String search) {
        if (!StringUtils.hasText(search)) {
            return null;
        }
        String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("actorEmail")), term),
                cb.like(cb.lower(root.get("message")), term)
        );
    }

    private HttpServletRequest resolveCurrentRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            return servletAttrs.getRequest();
        }
        return null;
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            int comma = xForwardedFor.indexOf(',');
            return comma > 0 ? xForwardedFor.substring(0, comma).trim() : xForwardedFor.trim();
        }
        return request.getRemoteAddr();
    }
}
