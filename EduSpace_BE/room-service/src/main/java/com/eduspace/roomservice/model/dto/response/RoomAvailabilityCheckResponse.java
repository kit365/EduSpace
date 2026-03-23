package com.eduspace.roomservice.model.dto.response;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomAvailabilityCheckResponse {
    Boolean available;
    String reason;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
}
