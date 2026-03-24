package com.eduspace.bookingservice.service;

import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.domain.entity.BookingDeposit;
import com.eduspace.bookingservice.domain.entity.BookingRefund;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.persistence.BookingDepositRepository;
import com.eduspace.bookingservice.persistence.BookingRefundRepository;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.web.dto.AdminHandleBookingRefundRequest;
import com.eduspace.bookingservice.web.dto.BookingRefundResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingRefundAdminService {

    private final BookingRefundRepository bookingRefundRepository;
    private final BookingRepository bookingRepository;
    private final BookingDepositRepository bookingDepositRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<BookingRefundResponse> listByBooking(Long bookingId) {
        return bookingRefundRepository.findByBooking_IdOrderByCreatedAtDesc(bookingId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingRefundResponse handle(Long refundId, AdminHandleBookingRefundRequest request, Jwt jwt) {
        BookingRefund refund = bookingRefundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalStateException("Refund request not found"));

        if (!"PENDING".equals(refund.getStatus())) {
            throw new IllegalStateException("This refund request has already been handled");
        }

        String actor = jwt != null && jwt.getSubject() != null ? jwt.getSubject() : "ADMIN";
        BookingEntity booking = refund.getBooking();

        if (Boolean.TRUE.equals(request.approved())) {
            refund.setStatus("REFUNDED");
            refund.setRefundTransactionId(request.refundTransactionId());
            if (request.adminEvidenceUrls() != null && !request.adminEvidenceUrls().isEmpty()) {
                try {
                    refund.setAdminEvidenceUrlsJson(objectMapper.writeValueAsString(request.adminEvidenceUrls()));
                } catch (Exception e) {
                    log.warn("Could not serialize admin evidence urls", e);
                }
            }
            refund.setRefundCompletedAt(LocalDateTime.now());

            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancelledBy(actor);
            booking.setRefundAmount(refund.getRequestedAmount());
            booking.setRefundMethod("BANK_TRANSFER");
            booking.setCancelRequested(false);

            // Cancel pending deposits
            List<BookingDeposit> deposits = bookingDepositRepository.findByBookingId(booking.getId());
            for (BookingDeposit d : deposits) {
                if ("PENDING".equalsIgnoreCase(d.getStatus())) {
                    d.setStatus("CANCELLED");
                    bookingDepositRepository.save(d);
                }
            }
        } else {
            refund.setStatus("REJECTED");
            booking.setCancelRequested(false);
            refund.setAdminEvidenceUrlsJson(null);
        }

        refund.setAdminDecisionNote(request.adminNote());
        refund.setProcessedBy(actor);
        refund.setProcessedAt(LocalDateTime.now());

        bookingRefundRepository.save(refund);
        bookingRepository.save(booking);

        return toResponse(refund);
    }

    private BookingRefundResponse toResponse(BookingRefund r) {
        List<String> adminEvidence = Collections.emptyList();
        if (r.getAdminEvidenceUrlsJson() != null && !r.getAdminEvidenceUrlsJson().isBlank()) {
            try {
                adminEvidence = objectMapper.readValue(r.getAdminEvidenceUrlsJson(), new TypeReference<>() {});
            } catch (Exception ignored) {
            }
        }
        return new BookingRefundResponse(
                r.getId(),
                r.getStatus(),
                r.getRequestedAmount(),
                r.getCurrency(),
                r.getCustomerReason(),
                r.getEvidenceUrls(),
                r.getAdminDecisionNote(),
                r.getProcessedBy(),
                r.getRefundTransactionId(),
                adminEvidence,
                r.getCreatedAt(),
                r.getProcessedAt(),
                r.getRefundCompletedAt()
        );
    }
}
