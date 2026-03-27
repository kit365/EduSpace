package com.eduspace.conversationservice.infrastructure.config.messaging_kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    private final KafkaProperties kafkaProperties;

    public KafkaTopicConfig(KafkaProperties kafkaProperties) {
        this.kafkaProperties = kafkaProperties;
    }

    @Bean
    public NewTopic conversationEventsTopic() {
        return TopicBuilder.name(kafkaProperties.getConversationEvents())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic assignStaffRequestTopic() {
        return TopicBuilder.name(kafkaProperties.getAssignStaffRequest())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic assignStaffResultTopic() {
        return TopicBuilder.name(kafkaProperties.getAssignStaffResult())
                .partitions(1)
                .replicas(1)
                .build();
    }
}
