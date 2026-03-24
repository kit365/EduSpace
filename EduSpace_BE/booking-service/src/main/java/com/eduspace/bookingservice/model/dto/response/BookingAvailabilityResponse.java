package com.eduspace.bookingservice.model.dto.response;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingAvailabilityResponse {
    private Long roomId;
    private LocalDate bookingDate;
    private List<TimeSlotSummaryResponse> slots;
}
