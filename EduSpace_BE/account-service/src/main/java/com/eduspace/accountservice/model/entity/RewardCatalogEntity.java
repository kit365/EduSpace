package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_catalog")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RewardCatalogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_id")
    Long id;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "description", length = 1000)
    String description;

    @Column(name = "points_required", nullable = false)
    Integer pointsRequired;

    @Builder.Default
    @Column(name = "stock")
    Integer stock = -1; // -1: không giới hạn

    @Builder.Default
    @Column(name = "is_active")
    Boolean isActive = true;

    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    // 2 người mua cùng 1 lúc -> xác định version để pick người nhanh hơn
    @Version
    @Column(name = "version")
    Long version;

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
