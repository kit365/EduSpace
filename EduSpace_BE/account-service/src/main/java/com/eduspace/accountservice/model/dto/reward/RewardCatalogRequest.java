package com.eduspace.accountservice.model.dto.reward;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RewardCatalogRequest {

    @NotBlank(message = "Reward name is required")
    String name;

    String description;

    @NotNull(message = "Points required is required")
    @PositiveOrZero(message = "Points required must be non-negative")
    Integer pointsRequired;

    @NotNull(message = "Stock is required")
    Integer stock; // -1 for unlimited

    Boolean isActive;

    String imageUrl;
}
