package com.eduspace.bookingservice.web.dto;

import java.time.LocalDateTime;

public record CreateDepositIntentResponse(
        Long depositId,
        LocalDateTime expiresAt,
        Long bookingId,
        String bookingCode
) {
}
