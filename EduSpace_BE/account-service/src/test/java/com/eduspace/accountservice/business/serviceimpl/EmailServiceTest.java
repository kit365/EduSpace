package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private SpringTemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailServiceImpl emailServiceImpl;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = emailServiceImpl;
        ReflectionTestUtils.setField(emailServiceImpl, "fromEmail", "no-reply@eduspace.com");
        ReflectionTestUtils.setField(emailServiceImpl, "displayName", "EduSpace");
        ReflectionTestUtils.setField(emailServiceImpl, "frontendUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(emailServiceImpl, "tokenExpiryHours", 24);
    }

    @Test
    void sendVerificationEmail_Success() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email/verify-email"), any(Context.class)))
                .thenReturn("<html>Test Content</html>");

        // Act
        emailService.sendVerificationEmail("user@example.com", "User Name", "token123");

        // Assert
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendVerificationEmail_MailError() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email/verify-email"), any(Context.class)))
                .thenReturn("<html>Test Content</html>");
        doThrow(new RuntimeException("SMTP Server Down")).when(mailSender).send(any(MimeMessage.class));

        // Act
        emailService.sendVerificationEmail("user@example.com", "User Name", "token123");

        // Assert
        verify(mailSender).send(mimeMessage);
        // Method catches exception and logs it, so it shouldn't throw to caller
    }
}
