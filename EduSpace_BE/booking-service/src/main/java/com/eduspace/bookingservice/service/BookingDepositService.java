package com.eduspace.bookingservice.service;

import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.domain.entity.BookingDeposit;
import com.eduspace.bookingservice.domain.entity.BookingDepositRefundPolicy;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.payment.GatewayCallbackResult;
import com.eduspace.bookingservice.payment.PayosGatewayAdapter;
import com.eduspace.bookingservice.persistence.BookingDepositRefundPolicyRepository;
import com.eduspace.bookingservice.persistence.BookingDepositRepository;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.web.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingDepositService {

    private static final int HOLD_MINUTES = 5;
    private static final long PAYOS_DEPOSIT_ORDER_PREFIX = 900_000_000_000L;

    private final BookingRepository bookingRepository;
    private final BookingDepositRepository bookingDepositRepository;
    private final BookingDepositRefundPolicyRepository refundPolicyRepository;
    private final PayosGatewayAdapter payosGatewayAdapter;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public CreateDepositIntentResponse createDepositIntent(CreateDepositIntentRequest request) {
        if (request.grandTotal() == null || request.grandTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Tổng tiền không hợp lệ.");
        }

        String code = "BK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        BookingEntity booking = new BookingEntity();
        booking.setBookingCode(code);
        booking.setSpaceRef(request.spaceRef());
        booking.setCustomerEmail(request.customerEmail());
        booking.setCustomerName(request.customerName());
        booking.setTotalAmount(request.grandTotal());
        booking.setPaidAmount(BigDecimal.ZERO);
        booking.setRemainingAmount(request.grandTotal());
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus("UNPAID");
        booking.setTemporary(true);
        booking = bookingRepository.save(booking);

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(HOLD_MINUTES);
        String holdJson = "{\"spaceRef\":\"" + (request.spaceRef() != null ? request.spaceRef() : "") + "\"}";

        BookingDeposit deposit = BookingDeposit.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .status("PENDING")
                .expiresAt(expiresAt)
                .holdPayloadJson(holdJson)
                .build();

        refundPolicyRepository.findDefaultActivePolicy().ifPresent(p -> applyDefaultRefundPolicy(deposit, p));

        BookingDeposit saved = bookingDepositRepository.save(deposit);

        return new CreateDepositIntentResponse(
                saved.getId(),
                saved.getExpiresAt(),
                booking.getId(),
                booking.getBookingCode()
        );
    }

    private void applyDefaultRefundPolicy(BookingDeposit deposit, BookingDepositRefundPolicy policy) {
        deposit.setRefundPolicy(policy);
        if (policy.getDepositPercentage() != null) {
            deposit.setDepositPercentage(policy.getDepositPercentage());
        }
    }

    @Transactional
    public CreateDepositPayosResponse createPayosCheckoutUrl(Long depositId, String returnUrl) {
        BookingDeposit deposit = bookingDepositRepository.findById(depositId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giữ chỗ với id: " + depositId));

        if (!"PENDING".equalsIgnoreCase(deposit.getStatus())) {
            throw new IllegalStateException("Giữ chỗ đã được xử lý hoặc hết hạn.");
        }
        if (deposit.getExpiresAt() != null && deposit.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Giữ chỗ đã hết hạn. Vui lòng chọn lại.");
        }
        if (deposit.getBookingId() == null) {
            throw new IllegalStateException("Giữ chỗ không gắn booking.");
        }

        BookingEntity booking = bookingRepository.findById(deposit.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy booking."));

        if (deposit.getCheckoutUrl() != null && !deposit.getCheckoutUrl().isBlank()
                && deposit.getPayosOrderCode() != null) {
            return new CreateDepositPayosResponse(
                    deposit.getId(),
                    deposit.getPayosOrderCode(),
                    deposit.getCheckoutUrl(),
                    deposit.getExpiresAt(),
                    booking.getId(),
                    booking.getBookingCode()
            );
        }

        Long payosOrderCode = deposit.getPayosOrderCode();
        if (payosOrderCode == null) {
            payosOrderCode = PAYOS_DEPOSIT_ORDER_PREFIX + deposit.getId();
            deposit.setPayosOrderCode(payosOrderCode);
        }

        BigDecimal total = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal percentage = deposit.getDepositPercentage() != null ? deposit.getDepositPercentage()
                : BigDecimal.valueOf(25);
        BigDecimal depositAmount = total
                .multiply(percentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (depositAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Số tiền cọc không hợp lệ.");
        }

        String desc = "Coc " + (booking.getBookingCode() != null ? booking.getBookingCode() : ("BK" + booking.getId()));
        long amount = depositAmount.longValue();

        String effectiveReturnUrl = (returnUrl != null && !returnUrl.isBlank()) ? returnUrl : frontendUrl;
        String checkoutUrl = payosGatewayAdapter.buildPaymentUrlByOrderCode(payosOrderCode, amount, desc, effectiveReturnUrl);
        deposit.setCheckoutUrl(checkoutUrl);
        bookingDepositRepository.save(deposit);

        return new CreateDepositPayosResponse(
                deposit.getId(),
                payosOrderCode,
                checkoutUrl,
                deposit.getExpiresAt(),
                booking.getId(),
                booking.getBookingCode()
        );
    }

    @Transactional
    public void finalizeDepositPaid(GatewayCallbackResult result) {
        Long orderCode;
        try {
            orderCode = Long.parseLong(result.transactionId());
        } catch (Exception ex) {
            log.warn("Invalid PayOS transaction id: {}", result.transactionId());
            return;
        }

        if (orderCode < PAYOS_DEPOSIT_ORDER_PREFIX) {
            return;
        }

        bookingDepositRepository.findFirstByPayosOrderCode(orderCode).ifPresent(deposit -> {
            try {
                if (result.rawPayload() != null && !result.rawPayload().isBlank()) {
                    deposit.setWebhookPayload(result.rawPayload());
                }

                if ("PAID".equalsIgnoreCase(deposit.getStatus()) || Boolean.TRUE.equals(deposit.getDepositPaid())) {
                    bookingDepositRepository.save(deposit);
                    return;
                }

                if (deposit.getExpiresAt() != null && deposit.getExpiresAt().isBefore(LocalDateTime.now())) {
                    bookingDepositRepository.save(deposit);
                    return;
                }

                if (!"PENDING".equalsIgnoreCase(deposit.getStatus())) {
                    bookingDepositRepository.save(deposit);
                    return;
                }

                if (deposit.getBookingId() == null) {
                    bookingDepositRepository.save(deposit);
                    return;
                }

                BookingEntity booking = bookingRepository.findById(deposit.getBookingId()).orElse(null);
                if (booking == null) {
                    bookingDepositRepository.save(deposit);
                    return;
                }

                BigDecimal total = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal percentage = deposit.getDepositPercentage() != null ? deposit.getDepositPercentage()
                        : BigDecimal.valueOf(25);
                BigDecimal depositAmount = total
                        .multiply(percentage)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                if (result.amount() != null) {
                    BigDecimal payosAmt = result.amount();
                    if (payosAmt.subtract(depositAmount).abs().compareTo(BigDecimal.ONE) > 0) {
                        log.warn("PayOS amount {} differs from expected deposit {} for orderCode {}",
                                payosAmt, depositAmount, orderCode);
                    }
                }

                booking.setPaidAmount(depositAmount);
                booking.setRemainingAmount(total.subtract(depositAmount).max(BigDecimal.ZERO));
                booking.setTemporary(false);
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setPaymentStatus(booking.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0 ? "PAID" : "PARTIAL");

                bookingRepository.save(booking);

                deposit.setStatus("PAID");
                deposit.setDepositPaid(true);
                deposit.setDepositPaidAt(LocalDateTime.now());
                deposit.setPaymentMethod("PAYOS");
                deposit.setNotes("Thanh toán cọc - PayOS");
                deposit.setDepositAmount(depositAmount);
                deposit.setBookingCode(booking.getBookingCode());
                bookingDepositRepository.save(deposit);

                log.info("Booking deposit paid via PayOS: bookingCode={}, depositId={}", booking.getBookingCode(), deposit.getId());
            } catch (Exception e) {
                log.error("Failed to finalize booking deposit for payosOrderCode={}", orderCode, e);
            }
        });
    }

    @Transactional(readOnly = true)
    public DepositStatusResponse getDepositStatus(Long depositId) {
        BookingDeposit d = bookingDepositRepository.findById(depositId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy deposit."));
        BookingEntity b = d.getBookingId() != null
                ? bookingRepository.findById(d.getBookingId()).orElse(null)
                : null;
        return new DepositStatusResponse(
                d.getId(),
                d.getStatus(),
                d.getDepositPaid(),
                b != null ? b.getBookingCode() : d.getBookingCode(),
                b != null ? b.getPaymentStatus() : null,
                b != null && b.getStatus() != null ? b.getStatus().name() : null
        );
    }
}
