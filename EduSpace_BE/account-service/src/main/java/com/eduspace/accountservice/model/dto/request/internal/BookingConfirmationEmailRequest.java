package com.eduspace.accountservice.model.dto.request.internal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingConfirmationEmailRequest {

    @NotBlank
    @Email
    private String toEmail;

    private String recipientName;

    @NotBlank
    private String bookingCode;

    private String roomTitle;

    @NotNull
    private LocalDate bookingDate;

    @NotNull
    private LocalDateTime startDateTime;

    @NotNull
    private LocalDateTime endDateTime;
}
