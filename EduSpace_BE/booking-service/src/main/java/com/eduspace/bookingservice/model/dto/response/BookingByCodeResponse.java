package com.eduspace.bookingservice.model.dto.response;

/** Minimal payload for account-service bank / refund flows. */
public record BookingByCodeResponse(Long id, String bookingCode, String userId, String guestEmail) {}
