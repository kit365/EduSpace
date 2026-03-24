package com.eduspace.bookingservice.service;

import com.eduspace.bookingservice.payment.PayosGatewayAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.webhooks.Webhook;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosWebhookService {

    private final PayosGatewayAdapter payosGatewayAdapter;
    private final BookingDepositService bookingDepositService;

    @Transactional
    public void handle(Webhook webhook) {
        var result = payosGatewayAdapter.verifyWebhook(webhook);
        if (!result.success()) {
            log.warn("PayOS webhook: payment not successful: {}", result.message());
            return;
        }
        bookingDepositService.finalizeDepositPaid(result);
    }
}
