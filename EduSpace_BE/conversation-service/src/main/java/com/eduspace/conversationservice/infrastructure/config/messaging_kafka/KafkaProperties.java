package com.eduspace.conversationservice.infrastructure.config.messaging_kafka;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.kafka.topics")
public class KafkaProperties {
    private String conversationEvents;
    private String assignStaffRequest;
    private String assignStaffResult;

    public String getConversationEvents() {
        return conversationEvents;
    }
}
