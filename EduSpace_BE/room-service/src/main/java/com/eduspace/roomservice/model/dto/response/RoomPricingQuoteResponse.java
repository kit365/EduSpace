package com.eduspace.roomservice.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class RoomPricingQuoteResponse {
    Long slotId;
    Integer durationMinutes;
    BigDecimal unitPrice;
    BigDecimal totalPrice;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
    String currency;
}
