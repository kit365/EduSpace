package com.eduspace.accountservice.model.dto.loyalty;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoyaltyConfigResponse {
    Long id;
    Integer vndPerPoint;
    LocalDateTime updatedAt;
}
