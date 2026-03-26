package com.eduspace.accountservice.infrastructure.client;

/** JSON from booking-service GET /api/v1/bookings/by-code/{code} */
public record BookingByCodeSnapshot(
        Long id, String bookingCode, String userId, String guestEmail) {}
