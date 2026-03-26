package com.eduspace.bookingservice.model.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingExtraAmenityResponse {
    private Long id;
    private Long amenityId;
    private Integer quantity;
}
