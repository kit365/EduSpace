package com.eduspace.roomservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "properties")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class PropertyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "owner_id")
    String ownerId; // UUID from account-service, no FK

    @Column(name = "name")
    String name;

    @Column(name = "property_type")
    String propertyType; // HOTEL, HOMESTAY, APARTMENT, PRIVATE_ROOM

    @Column(name = "contact_phone")
    String contactPhone;

    @Column(name = "contact_email")
    String contactEmail;

    @Column(name = "address", columnDefinition = "TEXT")
    String address;

    @Column(name = "logo", columnDefinition = "TEXT")
    String logo;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "status")
    String status;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "approved_by")
    String approvedBy; // UUID from account-service, no FK

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

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
