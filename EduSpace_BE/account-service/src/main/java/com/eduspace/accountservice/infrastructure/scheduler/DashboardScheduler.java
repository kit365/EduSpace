package com.eduspace.accountservice.infrastructure.scheduler;

import com.eduspace.accountservice.business.service.DashboardAggregatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DashboardScheduler {

    private final DashboardAggregatorService dashboardAggregatorService;

    /** 
     * Chạy snapshot tổng hợp dữ liệu mỗi ngày lúc 0h sáng.
     * Snapshot giúp Admin Dashboard load nhanh vì không cần query realtime từ nhiều service.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleDailyAggregation() {
        log.info("Starting scheduled daily dashboard aggregation");
        try {
            dashboardAggregatorService.aggregateAndSave();
            log.info("Finished scheduled daily dashboard aggregation successfully");
        } catch (Exception e) {
            log.error("Failed to run scheduled dashboard aggregation: {}", e.getMessage(), e);
        }
    }
}
