package com.eduspace.accountservice.infrastructure.messaging.producer;

import com.eduspace.accountservice.infrastructure.config.messaging.KafkaProperties;
import com.eduspace.accountservice.model.event.BaseEvent;
import com.eduspace.accountservice.model.event.SagaEventConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class StaffAssignmentProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaProperties kafkaProperties;

    public void sendAssignmentSuccess(String sagaId, String payload) {
        BaseEvent<String> event = BaseEvent.<String>builder()
                .sagaId(sagaId)
                .eventType(SagaEventConstants.ASSIGN_STAFF_SUCCESS)
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();

        log.info("Sending Success Result for Saga: {}", sagaId);
        kafkaTemplate.send(kafkaProperties.getAssignStaffResult(), sagaId, event);
    }

    public void sendAssignmentFailed(String sagaId, String reason) {
        BaseEvent<String> event = BaseEvent.<String>builder()
                .sagaId(sagaId)
                .eventType(SagaEventConstants.ASSIGN_STAFF_FAILED)
                .timestamp(LocalDateTime.now())
                .payload(reason)
                .build();

        log.info("Sending Failed Result for Saga: {}", sagaId);
        kafkaTemplate.send(kafkaProperties.getAssignStaffResult(), sagaId, event);
    }
}
