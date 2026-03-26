package com.eduspace.bookingservice.model.dto.response;

import com.eduspace.bookingservice.common.enums.DiscountType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class VoucherResponse {
    private Long id;
    private Long campaignId;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private Integer maxUses;
    private Integer usedCount;
    private Integer maxUsesPerUser;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Boolean isPublic;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
