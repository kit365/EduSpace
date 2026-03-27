package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.DashboardAggregatorService;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.entity.DashboardStatsEntity;
import com.eduspace.accountservice.persistence.repository.DashboardStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cung cấp dữ liệu cho Admin Dashboard.
 * Sử dụng cơ chế Snapshot để đảm bảo hiệu năng.
 */
@RestController
@RequestMapping("/api/v1/accounts/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardStatsRepository dashboardStatsRepository;
    private final DashboardAggregatorService aggregationService;

    /** Lấy snapshot mới nhất, nếu chưa có thì tạo mới ngay lập tức */
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsEntity> getLatestStats() {
        return dashboardStatsRepository.findLatest()
                .map(ApiResponse::success)
                .orElseGet(() -> ApiResponse.success(aggregationService.aggregateAndSave()));
    }

    /** Ép buộc tính toán lại snapshot ngay lập tức */
    @PostMapping("/stats/refresh")
    public ApiResponse<DashboardStatsEntity> refreshStats() {
        return ApiResponse.success(aggregationService.aggregateAndSave());
    }
}
