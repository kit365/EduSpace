package com.eduspace.bookingservice.web.dto;

import java.time.LocalDateTime;

public record CreateDepositPayosResponse(
        Long depositId,
        Long payosOrderCode,
        String checkoutUrl,
        LocalDateTime expiresAt,
        Long bookingId,
        String bookingCode
) {
}
