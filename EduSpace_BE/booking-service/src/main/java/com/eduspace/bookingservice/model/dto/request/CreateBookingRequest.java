package com.eduspace.bookingservice.model.dto.request;

import com.eduspace.bookingservice.common.enums.DurationUnit;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull
    private Long roomId;

    @NotBlank
    private String userId;

    @NotNull
    @FutureOrPresent
    private LocalDate bookingDate;

    @NotBlank
    private String guestEmail;

    @NotNull
    private LocalDateTime startDateTime;

    @NotNull
    private LocalDateTime endDateTime;

    private Integer durationValue;

    private DurationUnit durationUnit;

    private List<BookingExtraAmenityRequest> extraAmenities;
}
