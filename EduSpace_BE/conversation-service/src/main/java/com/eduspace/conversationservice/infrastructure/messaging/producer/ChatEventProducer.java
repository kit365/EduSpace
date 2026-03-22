package com.eduspace.conversationservice.infrastructure.messaging.producer;

import com.eduspace.conversationservice.model.event.BaseEvent;
import com.eduspace.conversationservice.model.event.SagaEventConstants;
import com.eduspace.conversationservice.infrastructure.config.messaging_kafka.KafkaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaProperties kafkaProperties;

    public void sendAssignStaffRequest(String sagaId, String conversationId, String customerId) {
        BaseEvent<String> event = BaseEvent.<String>builder()
                .sagaId(sagaId)
                .eventType(SagaEventConstants.ASSIGN_STAFF_REQUEST)
                .timestamp(LocalDateTime.now())
                .payload(conversationId + "|" + customerId)
                .build();

        log.info("Sending {} for conversation: {} with saga: {}", SagaEventConstants.ASSIGN_STAFF_REQUEST, conversationId, sagaId);
        kafkaTemplate.send(kafkaProperties.getAssignStaffRequest(), sagaId, event);
    }
}
