package com.eduspace.accountservice.model.dto.request.pointrule;

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
public class PointEarningRuleRequest {

    @NotBlank(message = "Action name is required")
    String actionName;

    @NotNull(message = "Points earned is required")
    @PositiveOrZero(message = "Points earned must be non-negative")
    Integer pointsEarned;

    String description;

    Boolean isActive;
}
