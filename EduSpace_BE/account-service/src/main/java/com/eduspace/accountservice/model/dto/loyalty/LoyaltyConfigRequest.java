package com.eduspace.accountservice.model.dto.loyalty;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoyaltyConfigRequest {

    @NotNull(message = "VND per point is required")
    @Positive(message = "VND per point must be positive")
    Integer vndPerPoint;
}
