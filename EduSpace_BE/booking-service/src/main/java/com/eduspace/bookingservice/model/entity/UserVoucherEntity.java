package com.eduspace.bookingservice.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_vouchers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "voucher_id"}))
public class UserVoucherEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @PrePersist
    public void onCreate() {
        this.claimedAt = LocalDateTime.now();
        if (this.isUsed == null) this.isUsed = false;
    }
}
