package com.eduspace.accountservice.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties(KycAiProperties.class)
public class KycAiConfiguration {

    @Bean(name = "kycAiWebClient")
    public WebClient kycAiWebClient(KycAiProperties props) {
        WebClient.Builder b = WebClient.builder().baseUrl(props.getBaseUrl());
        if (StringUtils.hasText(props.getApiKey())) {
            b.defaultHeader("X-API-Key", props.getApiKey());
        }
        return b.build();
    }
}
