package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.display-name}")
    private String displayName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.verification.token-expiry-hours}")
    private int tokenExpiryHours;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @PostConstruct
    void logMailConfig() {
        if (!StringUtils.hasText(mailUsername)) {
            log.warn(
                    "Spring Mail: spring.mail.username is empty — verification emails will NOT be sent. See docs/SPRING_MAIL.md");
        }
    }

    @Override
    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        if (!StringUtils.hasText(mailUsername)) {
            log.warn("Skip send verification email to {}: SMTP not configured (spring.mail.username empty)", toEmail);
            return;
        }
        try {
            log.info("[Mail] Sending verification email to={} from={}", toEmail, fromEmail);
            String verifyUrl = frontendUrl + "/verify-email?token=" + token;

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("verifyUrl", verifyUrl);
            context.setVariable("expiryHours", tokenExpiryHours);

            String htmlContent = templateEngine.process("email/verify-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, displayName);
            helper.setTo(toEmail);
            helper.setSubject("EduSpace - Xác thực email của bạn");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[Mail] SUCCESS verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error(
                    "[Mail] FAILED verification email to {} — {} ({})",
                    toEmail,
                    e.getMessage(),
                    e.getClass().getSimpleName(),
                    e);
        }
    }

    @Override
    @Async
    public void sendBookingConfirmationEmail(
            String toEmail,
            String recipientName,
            String bookingCode,
            String roomTitle,
            LocalDate bookingDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        if (!StringUtils.hasText(mailUsername)) {
            log.warn("Skip booking confirmation email to {}: SMTP not configured (spring.mail.username empty)", toEmail);
            return;
        }
        try {
            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy").withLocale(Locale.forLanguageTag("vi"));
            DateTimeFormatter dtFmt =
                    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withLocale(Locale.forLanguageTag("vi"));

            Context context = new Context();
            context.setVariable("recipientName", StringUtils.hasText(recipientName) ? recipientName : "Khách");
            context.setVariable("bookingCode", bookingCode);
            context.setVariable("roomTitle", StringUtils.hasText(roomTitle) ? roomTitle : "—");
            context.setVariable("bookingDate", bookingDate != null ? bookingDate.format(dateFmt) : "—");
            context.setVariable("startDateTime", startDateTime != null ? startDateTime.format(dtFmt) : "—");
            context.setVariable("endDateTime", endDateTime != null ? endDateTime.format(dtFmt) : "—");

            String htmlContent = templateEngine.process("email/booking-confirmation", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, displayName);
            helper.setTo(toEmail);
            helper.setSubject("EduSpace - Xác nhận đặt phòng " + bookingCode);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[Mail] SUCCESS booking confirmation sent to {}", toEmail);
        } catch (Exception e) {
            log.error(
                    "[Mail] FAILED booking confirmation to {} — {} ({})",
                    toEmail,
                    e.getMessage(),
                    e.getClass().getSimpleName(),
                    e);
        }
    }
}
