package com.eduspace.accountservice.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "integration")
public class IntegrationProperties {

    private final BookingService bookingService = new BookingService();

    @Getter
    @Setter
    public static class BookingService {
        private String baseUrl;
    }
}
