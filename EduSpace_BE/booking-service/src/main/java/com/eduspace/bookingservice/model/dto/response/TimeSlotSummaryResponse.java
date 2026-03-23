package com.eduspace.bookingservice.model.dto.response;

import java.time.LocalTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimeSlotSummaryResponse {
    private Long id;
    private String slotCode;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean available;
}
