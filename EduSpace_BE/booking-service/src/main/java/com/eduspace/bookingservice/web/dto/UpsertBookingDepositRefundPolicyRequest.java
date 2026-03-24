package com.eduspace.bookingservice.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpsertBookingDepositRefundPolicyRequest(
        @NotBlank String policyName,
        String description,
        @NotNull BigDecimal depositPercentage,
        @NotNull @Min(0) Integer fullRefundHours,
        @NotNull BigDecimal fullRefundPercentage,
        @NotNull @Min(0) Integer partialRefundHours,
        @NotNull BigDecimal partialRefundPercentage,
        @NotNull @Min(0) Integer noRefundHours,
        @NotNull BigDecimal noRefundPercentage,
        @NotNull BigDecimal noShowRefundPercentage,
        @NotNull BigDecimal noShowPenalty,
        @NotNull Boolean allowForceMajeure,
        @NotNull BigDecimal forceMajeureRefundPercentage,
        @NotNull Boolean forceMajeureRequiresEvidence,
        @NotNull Boolean isDefault,
        Integer displayOrder,
        String highlightText,
        @NotNull Boolean isActive
) {
}
