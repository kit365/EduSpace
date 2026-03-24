package com.eduspace.bookingservice.model.dto.integration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomPricingQuotePayload {
    private Long slotId;
    private Integer durationMinutes;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String currency;
}
