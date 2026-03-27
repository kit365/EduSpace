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

    public String getAssignStaffRequest() {
        return assignStaffRequest;
    }

    public String getAssignStaffResult() {
        return assignStaffResult;
    }

    public void setConversationEvents(String conversationEvents) {
        this.conversationEvents = conversationEvents;
    }

    public void setAssignStaffRequest(String assignStaffRequest) {
        this.assignStaffRequest = assignStaffRequest;
    }

    public void setAssignStaffResult(String assignStaffResult) {
        this.assignStaffResult = assignStaffResult;
    }
}
