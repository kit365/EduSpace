package com.eduspace.bookingservice.model.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class VoucherUsageResponse {
    private Long id;
    private Long voucherId;
    private String voucherCode;
    private Long bookingId;
    private String userId;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private LocalDateTime usedAt;
}
