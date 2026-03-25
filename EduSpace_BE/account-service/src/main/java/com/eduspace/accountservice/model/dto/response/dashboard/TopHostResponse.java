package com.eduspace.accountservice.model.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopHostResponse {
    private String hostId;
    private String hostName;
    private String hostAvatar;
    private Double totalRevenue;
    private Long totalBookings;
    private Integer activeListings;
}
