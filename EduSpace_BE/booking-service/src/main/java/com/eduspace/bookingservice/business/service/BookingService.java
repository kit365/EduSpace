package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingByCodeResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request);

    List<BookingResponse> getAllBookings();

    BookingResponse getBookingById(Long id);

    /** Lookup for account-service (bank information). */
    BookingByCodeResponse getByBookingCode(String bookingCode);

    BookingResponse cancelBooking(Long id);
}
