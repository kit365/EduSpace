package com.eduspace.roomservice.model.dto.response;

import lombok.*;
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
