package com.eduspace.conversationservice.infrastructure.messaging.producer;

import com.eduspace.conversationservice.model.event.BaseEvent;
import com.eduspace.conversationservice.model.event.SagaEventConstants;
import com.eduspace.conversationservice.infrastructure.config.messaging_kafka.KafkaProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ChatEventProducer {
    private static final Logger log = LoggerFactory.getLogger(ChatEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaProperties kafkaProperties;

    public ChatEventProducer(KafkaTemplate<String, Object> kafkaTemplate, KafkaProperties kafkaProperties) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaProperties = kafkaProperties;
    }

    public void sendAssignStaffRequest(String sagaId, String conversationId, String customerId) {
        BaseEvent<String> event = new BaseEvent<>();
        event.setSagaId(sagaId);
        event.setEventType(SagaEventConstants.ASSIGN_STAFF_REQUEST);
        event.setTimestamp(LocalDateTime.now());
        event.setPayload(conversationId + "|" + customerId);

        log.info("Sending {} for conversation: {} with saga: {}", SagaEventConstants.ASSIGN_STAFF_REQUEST, conversationId, sagaId);
        kafkaTemplate.send(kafkaProperties.getAssignStaffRequest(), sagaId, event);
    }
}
