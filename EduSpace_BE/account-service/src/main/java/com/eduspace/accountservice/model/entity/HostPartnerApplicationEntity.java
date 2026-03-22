package com.eduspace.accountservice.model.entity;

import com.eduspace.accountservice.common.enums.PartnerAppStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "host_partner_applications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostPartnerApplicationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "applicant_type", nullable = false, length = 32)
    String applicantType;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(length = 50)
    String phone;

    @Column(nullable = false)
    String email;

    @Column(columnDefinition = "TEXT")
    String address;

    @Column(columnDefinition = "TEXT")
    String message;

    @Column(name = "document_front_url", columnDefinition = "TEXT")
    String documentFrontUrl;

    @Column(name = "document_back_url", columnDefinition = "TEXT")
    String documentBackUrl;

    @Column(name = "business_license_url", columnDefinition = "TEXT")
    String businessLicenseUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    com.eduspace.accountservice.common.enums.PartnerAppStatus status;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    String adminNote;

    @Column(name = "reviewed_at")
    LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    String reviewedBy;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = com.eduspace.accountservice.common.enums.PartnerAppStatus.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
