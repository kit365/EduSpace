package com.eduspace.bookingservice.infrastructure.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class AccountFeignConfig {

    @Bean
    public RequestInterceptor accountInternalApiKeyInterceptor(
            @Value("${integration.account-service.internal-api-key:}") String apiKey) {
        return requestTemplate -> {
            if (StringUtils.hasText(apiKey)) {
                requestTemplate.header("X-Internal-Api-Key", apiKey);
            }
        };
    }
}
