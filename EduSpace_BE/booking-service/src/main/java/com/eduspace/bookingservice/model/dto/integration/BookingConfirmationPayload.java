package com.eduspace.bookingservice.model.dto.integration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Body gửi tới account-service để mail xác nhận đặt phòng. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationPayload {
    private String toEmail;
    private String recipientName;
    private String bookingCode;
    private String roomTitle;
    private LocalDate bookingDate;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
