package com.eduspace.accountservice.model.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDashboardStatsResponse {
    private long totalListings;
    private long pendingApprovals;
    private long newListingsToday;
    private Map<String, Long> categoryDistribution;
}
