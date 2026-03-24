package com.eduspace.bookingservice.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eduspace.bookingservice.config.PayosConfig;
import com.eduspace.bookingservice.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

@Slf4j
@Component
public class PayosGatewayAdapter {

    private static final String PAYOS_API_GET_LINK = "https://api-merchant.payos.vn/v2/payment-requests/%d";
    private static final String PAYOS_CHECKOUT_BASE = "https://pay.payos.vn/web/";

    private final PayOS payOS;
    private final ObjectMapper objectMapper;
    private final PayosConfig payosConfig;
    private final RestTemplate restTemplate;

    public PayosGatewayAdapter(PayOS payOS, ObjectMapper objectMapper, PayosConfig payosConfig) {
        this.payOS = payOS;
        this.objectMapper = objectMapper;
        this.payosConfig = payosConfig;
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String buildPaymentUrlByOrderCode(Long orderCode, long amount, String description, String returnUrl) {
        if (orderCode == null) {
            throw new PaymentException("Lỗi hệ thống: thiếu orderCode để tạo PayOS link.");
        }
        try {
            String desc = description != null ? description : "Thanh toán";
            if (desc.length() > 25) {
                desc = desc.substring(0, 25);
            }

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(desc)
                    .returnUrl(returnUrl)
                    .cancelUrl(returnUrl)
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("đã tồn tại") || msg.contains("already exist")) {
                ExistingLinkInfo existing = fetchExistingPaymentInfo(orderCode);
                if (existing != null && existing.checkoutUrl() != null) {
                    log.info("PayOS: returning existing payment link (orderCode={}).", orderCode);
                    return existing.checkoutUrl();
                }
            }
            log.error("PayosGatewayAdapter failed to create payment link (orderCode={}): {}", orderCode, msg);
            throw new PaymentException("PayOS Error: " + msg, e);
        }
    }

    private record ExistingLinkInfo(String checkoutUrl, long amount, String status) {}

    private ExistingLinkInfo fetchExistingPaymentInfo(Long orderNumericCode) {
        if (orderNumericCode == null) return null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", payosConfig.getClientId());
            headers.set("x-api-key", payosConfig.getApiKey());
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = String.format(PAYOS_API_GET_LINK, orderNumericCode);
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode root = objectMapper.readTree(resp.getBody());
                if ("00".equals(root.path("code").asText(""))) {
                    JsonNode data = root.path("data");
                    String status = data.path("status").asText("");
                    long amount = data.path("amount").asLong(0);
                    String id = data.path("id").asText("");
                    String checkoutUrl = !id.isBlank() ? PAYOS_CHECKOUT_BASE + id : null;
                    return new ExistingLinkInfo(checkoutUrl, amount, status);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not fetch existing PayOS link for orderCode {}: {}", orderNumericCode, ex.getMessage());
        }
        return null;
    }

    public GatewayCallbackResult verifyWebhook(Webhook webhook) {
        try {
            WebhookData verifiedData = payOS.webhooks().verify(webhook);
            boolean success = "00".equals(verifiedData.getCode());

            String rawPayloadJson = null;
            try {
                rawPayloadJson = objectMapper.writeValueAsString(verifiedData);
            } catch (Exception e) {
                log.warn("Could not serialize PayOS WebhookData to JSON: {}", e.getMessage());
            }

            return new GatewayCallbackResult(
                    success,
                    String.valueOf(verifiedData.getOrderCode()),
                    success ? "Thanh toán thành công qua PayOS"
                            : "Thanh toán thất bại qua PayOS. Code: " + verifiedData.getCode(),
                    java.math.BigDecimal.valueOf(verifiedData.getAmount()),
                    verifiedData.getCode(),
                    rawPayloadJson
            );
        } catch (Exception e) {
            log.error("PayOS callback verification failed", e);
            throw new PaymentException("PayOS verification failed: " + e.getMessage(), e);
        }
    }

    public boolean cancelPaymentLinkByOrderCode(Long orderCode) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", payosConfig.getClientId());
            headers.set("x-api-key", payosConfig.getApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);
            String body = "{\"cancellationReason\":\"User cancelled or session ended\"}";
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            String url = "https://api-merchant.payos.vn/v2/payment-requests/" + orderCode + "/cancel";
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception ex) {
            log.warn("PayOS cancel failed for orderCode {}: {}", orderCode, ex.getMessage());
            return false;
        }
    }
}
