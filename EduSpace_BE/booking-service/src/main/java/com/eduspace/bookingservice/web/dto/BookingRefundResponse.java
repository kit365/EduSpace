package com.eduspace.bookingservice.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingRefundResponse(
        Long id,
        String status,
        BigDecimal requestedAmount,
        String currency,
        String customerReason,
        String evidenceUrls,
        String adminDecisionNote,
        String processedBy,
        String refundTransactionId,
        List<String> adminEvidenceUrls,
        LocalDateTime createdAt,
        LocalDateTime processedAt,
        LocalDateTime refundCompletedAt
) {
}
