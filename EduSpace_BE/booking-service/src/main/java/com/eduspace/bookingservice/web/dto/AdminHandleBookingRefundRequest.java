package com.eduspace.bookingservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AdminHandleBookingRefundRequest(
        @NotNull Boolean approved,
        String adminNote,
        String refundTransactionId,
        List<String> adminEvidenceUrls
) {
}
