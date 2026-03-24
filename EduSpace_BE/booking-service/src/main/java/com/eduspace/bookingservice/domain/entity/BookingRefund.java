package com.eduspace.bookingservice.domain.entity;

import com.eduspace.bookingservice.model.entity.BookingEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRefund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private BookingEntity booking;

    @Column(name = "bank_information_id")
    private Long bankInformationId;

    @Column(name = "requested_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "customer_reason", columnDefinition = "TEXT", nullable = false)
    private String customerReason;

    @Column(name = "evidence_urls", columnDefinition = "TEXT")
    private String evidenceUrls;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "admin_decision_note", columnDefinition = "TEXT")
    private String adminDecisionNote;

    @Column(name = "processed_by", length = 255)
    private String processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "refund_transaction_id", length = 100)
    private String refundTransactionId;

    @Column(name = "refund_method", length = 50)
    private String refundMethod;

    @Column(name = "refund_completed_at")
    private LocalDateTime refundCompletedAt;

    /** JSON array of URLs */
    @Column(name = "admin_evidence_urls", columnDefinition = "TEXT")
    private String adminEvidenceUrlsJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime n = LocalDateTime.now();
        if (createdAt == null) createdAt = n;
        updatedAt = n;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
