package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
@Table(name = "properties")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class PropertyEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "owner_id")
    String ownerId; // UUID from account-service

    @Column(name = "name_vi")
    String nameVi;

    @Column(name = "name_en")
    String nameEn;

    @Column(name = "property_type")
    String propertyType;

    @Column(name = "contact_phone")
    String contactPhone;

    @Column(name = "contact_email")
    String contactEmail;

    @Column(name = "province_code")
    String provinceCode;

    @Column(name = "district_code")
    String districtCode;

    @Column(name = "ward_code")
    String wardCode;

    @Column(name = "address_detail_vi")
    String addressDetailVi;

    @Column(name = "address_detail_en")
    String addressDetailEn;

    @Column(name = "latitude", precision = 10, scale = 8)
    BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    BigDecimal longitude;

    @Column(name = "logo", columnDefinition = "TEXT")
    String logo;

    @Column(name = "logo_alt_vi")
    String logoAltVi;

    @Column(name = "logo_alt_en")
    String logoAltEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    String descriptionEn;

    @Column(name = "status")
    String status; // PENDING, APPROVED, REJECTED, SUSPENDED

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "approved_by")
    String approvedBy; // UUID from account-service

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Builder.Default
    @Column(name = "deleted", nullable = false)
    boolean deleted = false;

    /** Phút nghỉ giữa các slot liên tiếp (dọn phòng / buffer). */
    @Builder.Default
    @Column(name = "schedule_buffer_minutes", nullable = false)
    Integer scheduleBufferMinutes = 0;

    /** Cho phép sinh slot trên toàn khung 24h (không giới open/close theo ngày). */
    @Builder.Default
    @Column(name = "schedule_is_over_day", nullable = false)
    Boolean scheduleIsOverDay = false;
}
