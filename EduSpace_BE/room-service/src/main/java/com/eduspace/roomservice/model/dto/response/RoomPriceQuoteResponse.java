package com.eduspace.roomservice.model.dto.response;

import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomPriceQuoteResponse {

    Integer roomId;
    Integer durationMinutes;
    BigDecimal durationHours;
    Integer minDuration;
    Integer stepUnit;
    Integer matchedRuleId;
    String pricingMode;
    BigDecimal unitPrice;
    BigDecimal subtotal;
    boolean weekendSurchargeApplied;
    BigDecimal weekendSurchargePercent;
    BigDecimal weekendSurchargeAmount;
    BigDecimal total;
}
