package com.eduspace.accountservice.model.dto.reward;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RewardCatalogResponse {
    Long id;
    String name;
    String description;
    Integer pointsRequired;
    Integer stock;
    Boolean isActive;
    String imageUrl;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
