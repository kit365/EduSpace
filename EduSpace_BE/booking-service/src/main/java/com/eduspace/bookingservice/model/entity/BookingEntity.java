package com.eduspace.bookingservice.model.entity;

import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.common.enums.DurationUnit;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    /** Nullable until a room slot is linked (deposit-only flow). */
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "user_id", length = 100)
    private String userId;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "slot_id")
    private Long slotId;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "duration_value")
    private Integer durationValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "duration_unit", length = 20)
    private DurationUnit durationUnit;

    @Column(name = "start_datetime")
    private LocalDateTime startDateTime;

    @Column(name = "end_datetime")
    private LocalDateTime endDateTime;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    /** Deposit / PayOS totals (see V4 migration). */
    @Column(name = "space_ref", length = 100)
    private String spaceRef;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "remaining_amount", precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "is_temporary")
    private Boolean temporary;

    @Column(name = "cancel_requested")
    private Boolean cancelRequested;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "cancelled_reason")
    private String cancelledReason;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_method", length = 50)
    private String refundMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (temporary == null) {
            temporary = true;
        }
        if (cancelRequested == null) {
            cancelRequested = false;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
