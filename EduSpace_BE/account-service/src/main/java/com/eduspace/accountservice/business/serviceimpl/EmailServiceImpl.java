package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
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

    @Override
    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        try {
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
            log.info("Verification email sent to: {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send verification email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
