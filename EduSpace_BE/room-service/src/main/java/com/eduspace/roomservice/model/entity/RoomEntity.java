package com.eduspace.roomservice.model.entity;

import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "room_id")
    String id;

    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    FacilityEntity facility;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "type", nullable = false)
    String type;

    @Column(name = "capacity", nullable = false)
    Integer capacity;

    @Column(name = "size_sqm")
    BigDecimal sizeSqm;

    @Column(name = "price_per_hour", nullable = false)
    Long pricePerHour;

    @Column(name = "cover_image_url")
    String coverImageUrl;

    @Column(name = "description")
    String description;

    @Column(name = "additional_info")
    String additionalInfo;

    @Builder.Default
    @Column(name = "instant_book")
    Boolean instantBook = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    RoomApprovalStatus approvalStatus = RoomApprovalStatus.draft;

    @Column(name = "rejection_reason")
    String rejectionReason;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Column(name = "approved_by")
    String approvedBy;

    @Builder.Default
    @Column(name = "avg_rating")
    BigDecimal avgRating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "review_count")
    Integer reviewCount = 0;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

