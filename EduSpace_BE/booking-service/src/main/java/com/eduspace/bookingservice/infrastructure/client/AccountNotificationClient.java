package com.eduspace.bookingservice.infrastructure.client;

import com.eduspace.bookingservice.infrastructure.config.AccountFeignConfig;
import com.eduspace.bookingservice.model.dto.integration.AccountApiResponse;
import com.eduspace.bookingservice.model.dto.integration.BookingConfirmationPayload;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "account-service",
        url = "${integration.account-service.base-url:http://localhost:8081}",
        contextId = "accountNotificationClient",
        configuration = AccountFeignConfig.class)
public interface AccountNotificationClient {

    @PostMapping("/api/v1/internal/notifications/booking-confirmation")
    AccountApiResponse sendBookingConfirmation(@RequestBody BookingConfirmationPayload body);
}
