package com.eduspace.accountservice.business.service;

public interface EmailService {

    void sendVerificationEmail(String toEmail, String fullName, String token);
}
