package com.eduspace.accountservice.infrastructure.config.messaging;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.kafka.topics")
public class KafkaProperties {
    private String assignStaffRequest;
    private String assignStaffResult;
    private String ekycResult;
}
