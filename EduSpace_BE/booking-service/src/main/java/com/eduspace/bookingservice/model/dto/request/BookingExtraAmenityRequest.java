package com.eduspace.bookingservice.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingExtraAmenityRequest {

    @NotNull
    private Long amenityId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
