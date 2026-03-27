package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.entity.DashboardStatsEntity;

/**
 * Service tổng hợp dữ liệu Dashboard từ nhiều microservices.
 */
public interface DashboardAggregatorService {
    
    /**
     * Thu thập dữ liệu và lưu thành một bản Snapshot mới.
     * @return DashboardStatsEntity bản ghi snapshot vừa lưu.
     */
    DashboardStatsEntity aggregateAndSave();
}
