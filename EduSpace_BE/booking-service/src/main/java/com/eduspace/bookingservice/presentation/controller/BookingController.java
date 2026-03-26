package com.eduspace.bookingservice.presentation.controller;

import com.eduspace.bookingservice.business.service.BookingService;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingByCodeResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "booking-service", "status", "UP");
    }

    /** Public lookup for account-service (bank info). */
    @GetMapping("/by-code/{bookingCode}")
    public BookingByCodeResponse getByBookingCode(@PathVariable String bookingCode) {
        return bookingService.getByBookingCode(bookingCode);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public BookingResponse getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }

}
