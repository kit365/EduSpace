package com.eduspace.bookingservice.payment;

import java.math.BigDecimal;

public record GatewayCallbackResult(
        boolean success,
        String transactionId,
        String message,
        BigDecimal amount,
        String gatewayResponseCode,
        String rawPayload
) {
}
