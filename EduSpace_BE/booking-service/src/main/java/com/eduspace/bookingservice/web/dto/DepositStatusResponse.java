package com.eduspace.bookingservice.web.dto;

public record DepositStatusResponse(
        Long depositId,
        String status,
        Boolean depositPaid,
        String bookingCode,
        String paymentStatus,
        String bookingStatus
) {
}
