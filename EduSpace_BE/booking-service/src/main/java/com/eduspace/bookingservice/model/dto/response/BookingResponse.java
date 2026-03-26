package com.eduspace.bookingservice.model.dto.response;

import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.common.enums.DurationUnit;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long roomId;
    private String userId;
    private String guestEmail;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDate bookingDate;
    private Long slotId;
    private Integer durationValue;
    private DurationUnit durationUnit;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private java.math.BigDecimal totalPrice;
    private List<TimeSlotSummaryResponse> slots;
    private List<BookingExtraAmenityResponse> extraAmenities;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
