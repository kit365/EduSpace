package com.eduspace.conversationservice.infrastructure.messaging.consumer;

import com.eduspace.conversationservice.business.saga.handler.StaffAssignmentSagaHandler;
import com.eduspace.conversationservice.model.event.BaseEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StaffAssignmentResultConsumer {

    private final StaffAssignmentSagaHandler sagaHandler;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${app.kafka.topics.assign-staff-result}",
            groupId = "conversation-service-group",
            containerFactory = "sagaAssignStaffKafkaListenerContainerFactory")
    public void consumeStaffAssignmentResult(String messageJson) {
        final BaseEvent<String> event;
        try {
            event = objectMapper.readValue(messageJson, new TypeReference<BaseEvent<String>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize assign-staff result: {}", messageJson, e);
            return;
        }
        log.info("Received event {} for saga {}", event.getEventType(), event.getSagaId());
        sagaHandler.handleAssignmentResult(event);
    }
}
