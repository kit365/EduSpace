package com.eduspace.accountservice.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_config")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyConfigEntity {

    @Id
    @Column(name = "id")
    Long id;

    @Column(name = "vnd_per_point", nullable = false)
    Integer vndPerPoint;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
