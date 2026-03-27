package com.eduspace.bookingservice.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "integration")
public class IntegrationProperties {

    private final RoomService roomService = new RoomService();
    private final AccountService accountService = new AccountService();

    @Getter
    @Setter
    public static class RoomService {
        private String baseUrl;
    }

    @Getter
    @Setter
    public static class AccountService {
        private String baseUrl;
        private String internalApiKey;
    }
}
