package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.EmailService;
import com.eduspace.accountservice.model.dto.request.internal.BookingConfirmationEmailRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {

    private final EmailService emailService;

    @PostMapping("/booking-confirmation")
    public ApiResponse<Void> sendBookingConfirmation(@Valid @RequestBody BookingConfirmationEmailRequest request) {
        emailService.sendBookingConfirmationEmail(
                request.getToEmail(),
                request.getRecipientName(),
                request.getBookingCode(),
                request.getRoomTitle(),
                request.getBookingDate(),
                request.getStartDateTime(),
                request.getEndDateTime());
        return ApiResponse.success(null);
    }
}
