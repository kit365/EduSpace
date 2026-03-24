package com.eduspace.bookingservice.web;

import com.eduspace.bookingservice.payment.PayosGatewayAdapter;
import com.eduspace.bookingservice.service.PayosWebhookService;
import com.eduspace.bookingservice.web.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.model.webhooks.Webhook;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "PayOS webhook")
public class PaymentController {

    private final PayosWebhookService payosWebhookService;
    private final PayosGatewayAdapter payosGatewayAdapter;
    private final ObjectMapper objectMapper;

    @GetMapping(value = "/payos/webhook", consumes = MediaType.ALL_VALUE)
    @Operation(summary = "PayOS webhook probe (GET)")
    public ResponseEntity<Void> payosWebhookCheck() {
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/payos/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "PayOS webhook (POST)")
    public ResponseEntity<Void> payosWebhook(@RequestBody Webhook webhook) {
        try {
            log.debug("PayOS webhook: {}", objectMapper.writeValueAsString(webhook));
        } catch (Exception e) {
            log.debug("PayOS webhook received (serialize skipped)");
        }
        payosWebhookService.handle(webhook);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/payos/cancel")
    @Operation(summary = "Hủy link PayOS (best-effort)")
    public ResponseEntity<ApiResponse<Boolean>> cancelPayos(@RequestParam Long orderCode) {
        boolean cancelled = payosGatewayAdapter.cancelPaymentLinkByOrderCode(orderCode);
        return ResponseEntity.ok(ApiResponse.ok(cancelled));
    }
}
