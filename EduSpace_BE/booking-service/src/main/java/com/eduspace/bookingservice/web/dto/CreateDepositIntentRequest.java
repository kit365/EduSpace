package com.eduspace.bookingservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateDepositIntentRequest(
        String spaceRef,
        String customerEmail,
        String customerName,
        @NotNull @DecimalMin("0.01") BigDecimal grandTotal
) {
}
