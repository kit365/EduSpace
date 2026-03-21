package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "rooms")
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    PropertyEntity property;

    @Column(name = "room_type")
    String roomType;

    @Column(name = "booking_type")
    String bookingType;

    @Column(name = "name")
    String name;

    /**
     * Chuỗi hiển thị địa chỉ phòng: thường = địa chỉ chi nhánh (address_detail) + phòng / tầng.
     * Khớp cột {@code location} trên DB (legacy / admin tools).
     */
    @Column(name = "location", length = 500)
    String location;

    @Column(name = "slug", length = 220, unique = true)
    String slug;

    @Column(name = "capacity")
    Integer capacity;

    @Column(name = "area", precision = 10, scale = 2)
    BigDecimal area;

    @Column(name = "room_number", length = 50)
    String roomNumber;

    @Column(name = "floor_number", length = 50)
    String floorNumber;

    @Builder.Default
    @Column(name = "is_24_7", nullable = false)
    Boolean is24_7 = false;

    @Column(name = "price_per_hour", precision = 15, scale = 2)
    BigDecimal pricePerHour;

    @Column(name = "price_per_day", precision = 15, scale = 2)
    BigDecimal pricePerDay;

    @Builder.Default
    @Column(name = "min_booking_hours", nullable = false)
    Integer minBookingHours = 1;

    @Column(name = "images")
    String images;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "status")
    String status;

    @Column(name = "approval_status")
    String approvalStatus;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    /** JSON RoomRequest — chờ admin duyệt mới áp vào phòng. */
    @Column(name = "pending_edit_payload", columnDefinition = "TEXT")
    String pendingEditPayload;

    /** NULL / NONE = không có; PENDING = chờ duyệt chỉnh sửa. */
    @Column(name = "pending_edit_status", length = 30)
    String pendingEditStatus;

    @Column(name = "pending_edit_rejection_note", columnDefinition = "TEXT")
    String pendingEditRejectionNote;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    BigDecimal avgRating;

    @Column(name = "review_count")
    Integer reviewCount;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
