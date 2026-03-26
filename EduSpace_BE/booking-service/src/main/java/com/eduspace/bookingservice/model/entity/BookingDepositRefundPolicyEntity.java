package com.eduspace.bookingservice.model.entity;

import com.eduspace.bookingservice.common.enums.BookingPolicyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "booking_deposit_refund_policies")
public class BookingDepositRefundPolicyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_name", nullable = false, length = 100)
    private String policyName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false, length = 20)
    private BookingPolicyType policyType;

    @Column(name = "deposit_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal depositPercentage = new BigDecimal("25.00");

    @Column(name = "start_hour")
    private Integer startHour;

    @Column(name = "end_hour")
    private Integer endHour;

    @Column(name = "full_refund_hours")
    private Integer fullRefundHours;

    @Column(name = "full_refund_percentage", precision = 5, scale = 2)
    private BigDecimal fullRefundPercentage;

    @Column(name = "partial_refund_hours")
    private Integer partialRefundHours;

    @Column(name = "partial_refund_percentage", precision = 5, scale = 2)
    private BigDecimal partialRefundPercentage;

    @Column(name = "no_refund_hours")
    private Integer noRefundHours;

    @Column(name = "no_refund_percentage", precision = 5, scale = 2)
    private BigDecimal noRefundPercentage;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "highlight_text", length = 255)
    private String highlightText;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
