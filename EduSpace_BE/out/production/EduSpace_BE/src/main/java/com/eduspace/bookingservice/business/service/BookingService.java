package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingAvailabilityResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request);

    List<BookingResponse> getAllBookings();

    BookingResponse getBookingById(Long id);

    BookingResponse cancelBooking(Long id);

    BookingAvailabilityResponse getAvailability(Long roomId, LocalDate bookingDate);
}
