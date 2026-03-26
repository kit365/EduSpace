package com.eduspace.accountservice.business.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface EmailService {

    void sendVerificationEmail(String toEmail, String fullName, String token);

    void sendBookingConfirmationEmail(
            String toEmail,
            String recipientName,
            String bookingCode,
            String roomTitle,
            LocalDate bookingDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime);

    void sendManagerAssignedEmail(String toEmail, String fullName, Long branchPropertyId);

    void sendManagerInviteEmail(
            String toEmail,
            String fullName,
            Long branchPropertyId,
            String temporaryPassword);
}
