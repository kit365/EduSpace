package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.model.entity.ExtraBookingAmenityEntity;
import java.util.List;

public interface BookingPersistenceService {

    record PersistedBooking(BookingEntity booking, List<ExtraBookingAmenityEntity> extras) {}

    PersistedBooking saveBookingAndExtras(CreateBookingRequest request);

    /** Xóa booking + extra amenities (compensation khi gửi mail thất bại). */
    void deleteBookingAndExtras(Long bookingId);
}
