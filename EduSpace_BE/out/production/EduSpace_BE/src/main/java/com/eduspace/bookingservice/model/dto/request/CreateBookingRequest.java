package com.eduspace.bookingservice.model.dto.request;

import com.eduspace.bookingservice.common.enums.DurationUnit;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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

    private List<Long> slotIds;

    private Long slotId;

    private Integer durationValue;

    private DurationUnit durationUnit;
}
