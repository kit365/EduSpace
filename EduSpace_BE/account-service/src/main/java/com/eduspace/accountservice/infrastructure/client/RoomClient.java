package com.eduspace.accountservice.infrastructure.client;

import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.dashboard.PropertyResponse;
import com.eduspace.accountservice.model.dto.response.dashboard.RoomDashboardStatsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "room-service")
public interface RoomClient {
    @GetMapping("/api/v1/rooms/internal/stats")
    ApiResponse<RoomDashboardStatsResponse> getStats();

    @GetMapping("/api/v1/rooms/internal/properties/pending")
    ApiResponse<List<PropertyResponse>> getPendingProperties();
}
