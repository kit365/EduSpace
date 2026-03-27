package com.eduspace.bookingservice.model.dto.integration;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomAvailabilityCheckPayload {
    private Boolean available;
    private String reason;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
