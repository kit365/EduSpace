package com.eduspace.conversationservice.infrastructure.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class KafkaTopics {

    private final String conversationEventsTopic;

    public KafkaTopics(@Value("${app.kafka.topics.conversation-events}") String conversationEventsTopic) {
        this.conversationEventsTopic = conversationEventsTopic;
    }

    public String conversationEvents() {
        return conversationEventsTopic;
    }
}

