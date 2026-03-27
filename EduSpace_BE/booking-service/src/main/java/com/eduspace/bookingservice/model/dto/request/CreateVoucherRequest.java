package com.eduspace.bookingservice.model.dto.request;

import com.eduspace.bookingservice.common.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateVoucherRequest {

    private Long campaignId;

    @NotBlank
    @Size(min = 3, max = 50)
    private String code;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal discountValue;

    @DecimalMin("0")
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    /** Chỉ áp dụng khi discountType = PERCENTAGE. */
    @DecimalMin("0.01")
    private BigDecimal maxDiscountAmount;

    @Positive
    private Integer maxUses;

    @Min(1)
    private Integer maxUsesPerUser = 1;

    @NotNull
    private LocalDateTime validFrom;

    @NotNull
    private LocalDateTime validUntil;

    private Boolean isPublic = true;

    private Boolean isActive = true;
}
