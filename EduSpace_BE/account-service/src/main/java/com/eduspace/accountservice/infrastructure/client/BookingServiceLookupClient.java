package com.eduspace.accountservice.infrastructure.client;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class BookingServiceLookupClient {

    private final RestTemplate restTemplate;

    public BookingServiceLookupClient(@Qualifier("loadBalancedRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("${integration.booking-service.base-url:http://localhost:8082}")
    private String baseUrl;

    public Optional<BookingByCodeSnapshot> findByBookingCode(String bookingCode) {
        if (bookingCode == null || bookingCode.isBlank()) {
            return Optional.empty();
        }
        try {
            BookingByCodeSnapshot body = restTemplate.getForObject(
                    baseUrl + "/api/v1/bookings/by-code/{code}", BookingByCodeSnapshot.class, bookingCode.trim());
            return Optional.ofNullable(body);
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            if (status != null && status.value() == 404) {
                return Optional.empty();
            }
            throw e;
        }
    }
}
