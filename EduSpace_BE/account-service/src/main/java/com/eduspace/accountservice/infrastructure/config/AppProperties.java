package com.eduspace.accountservice.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Mail mail = new Mail();
    private String frontendUrl;
    private String gatewayUrl;
    private final Verification verification = new Verification();

    private final SupportPresence supportPresence = new SupportPresence();
    private final Internal internal = new Internal();

    @Getter
    @Setter
    public static class Mail {
        private String from;
        private String displayName;
    }

    @Getter
    @Setter
    public static class Verification {
        private int tokenExpiryHours;
    }

    @Getter
    @Setter
    public static class SupportPresence {
        private long windowMs;
    }

    @Getter
    @Setter
    public static class Internal {
        private String apiKey;
    }
}
