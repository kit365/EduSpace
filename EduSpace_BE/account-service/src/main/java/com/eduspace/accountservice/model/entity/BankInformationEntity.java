package com.eduspace.accountservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bank_information")
public class BankInformationEntity {

    public static final String ACCOUNT_TYPE_GUEST = "GUEST";
    public static final String ACCOUNT_TYPE_CUSTOMER = "CUSTOMER";
    public static final String ACCOUNT_TYPE_SYSTEM = "SYSTEM";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "order_id", length = 36)
    private String orderId;

    @Column(name = "user_email", length = 255)
    private String userEmail;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "account_holder_name", nullable = false, length = 255)
    private String accountHolderName;

    @Column(name = "bank_code", nullable = false, length = 50)
    private String bankCode;

    @Column(name = "bank_name", nullable = false, length = 255)
    private String bankName;

    @Column(name = "is_verify", nullable = false)
    private boolean verify;

    @Column(name = "is_default", nullable = false)
    private boolean defaultAccount;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "account_type", nullable = false, length = 50)
    private String accountType = ACCOUNT_TYPE_CUSTOMER;

    @Column(name = "vietqr_image_url", columnDefinition = "TEXT")
    private String vietqrImageUrl;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
