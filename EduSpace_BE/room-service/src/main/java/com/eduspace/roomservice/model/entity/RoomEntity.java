package com.eduspace.roomservice.model.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RoomEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    PropertyEntity property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    RoomCategoryEntity category;

    @Column(name = "room_type")
    String roomType;

    @Column(name = "booking_type")
    String bookingType;

    @Column(name = "name_vi")
    String nameVi;

    @Column(name = "name_en")
    String nameEn;

    @Column(name = "location_vi", columnDefinition = "TEXT")
    String locationVi;

    @Column(name = "location_en", columnDefinition = "TEXT")
    String locationEn;

    @Column(name = "slug", unique = true)
    String slug;

    @Column(name = "capacity")
    Integer capacity;

    @Column(name = "area", precision = 10, scale = 2)
    BigDecimal area;

    @Column(name = "room_number")
    String roomNumber;

    @Column(name = "floor_number")
    String floorNumber;

    @Column(name = "latitude", precision = 10, scale = 6)
    BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    BigDecimal longitude;

    @Builder.Default
    @Column(name = "is_24_7")
    Boolean is24_7 = false;

    @Column(name = "price_per_hour", precision = 15, scale = 2)
    BigDecimal pricePerHour;

    @Column(name = "price_per_day", precision = 15, scale = 2)
    BigDecimal pricePerDay;

    @Builder.Default
    @Column(name = "min_booking_hours")
    Integer minBookingHours = 1;

    @Column(name = "images", columnDefinition = "TEXT")
    String images;

    @Column(name = "images_alt_vi", columnDefinition = "TEXT")
    String imagesAltVi;

    @Column(name = "images_alt_en", columnDefinition = "TEXT")
    String imagesAltEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    String descriptionEn;

    @Column(name = "status")
    String status; // ACTIVE, INACTIVE, MAINTENANCE

    @Column(name = "approval_status")
    String approvalStatus; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @Column(name = "pending_edit_payload", columnDefinition = "TEXT")
    String pendingEditPayload;

    @Column(name = "pending_edit_status")
    String pendingEditStatus; // NONE, PENDING, APPROVED, REJECTED

    @Column(name = "pending_edit_rejection_note", columnDefinition = "TEXT")
    String pendingEditRejectionNote;

    @Builder.Default
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    List<RoomPolicyEntity> policies = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    List<RoomAmenityEntity> amenities = new ArrayList<>();

    @Builder.Default
    @Column(name = "avg_rating")
    BigDecimal avgRating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "review_count")
    Integer reviewCount = 0;

    @Column(name = "approved_by")
    String approvedBy;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;
}
