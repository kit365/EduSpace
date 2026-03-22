package com.eduspace.accountservice.infrastructure.messaging.consumer;

import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.infrastructure.messaging.producer.StaffAssignmentProducer;
import com.eduspace.accountservice.model.event.BaseEvent;
import com.eduspace.accountservice.model.event.SagaEventConstants;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StaffAssignmentConsumer {

    private final UserService userService;
    private final StaffAssignmentProducer staffAssignmentProducer;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${app.kafka.topics.assign-staff-request}",
            groupId = "${spring.kafka.consumer.group-id}-assign-staff",
            containerFactory = "sagaKafkaListenerContainerFactory")
    public void consumeAssignStaffRequest(String messageJson) {
        final BaseEvent<String> event;
        try {
            event = objectMapper.readValue(messageJson, new TypeReference<BaseEvent<String>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize assign-staff request: {}", messageJson, e);
            return;
        }
        if (event.getSagaId() == null || event.getEventType() == null || event.getPayload() == null) {
            log.warn("Invalid assign-staff event (missing sagaId, eventType, or payload)");
            return;
        }

        log.info("Received {} for Saga: {}", event.getEventType(), event.getSagaId());

        if (!SagaEventConstants.ASSIGN_STAFF_REQUEST.equals(event.getEventType())) {
            log.warn("Unknown event type received: {}", event.getEventType());
            return;
        }

        try {
            // Payload format: "conversationId|customerId"
            String[] parts = event.getPayload().split("\\|");
            if (parts.length < 2) {
                log.error("Invalid payload format for Saga: {}", event.getSagaId());
                staffAssignmentProducer.sendAssignmentFailed(event.getSagaId(), "Invalid payload format");
                return;
            }

            String conversationId = parts[0];
            String customerId = parts[1];

            log.info("Assigning staff for customer: {} in conversation: {}", customerId, conversationId);
            String staffId = userService.assignStaff(customerId);

            if (staffId != null) {
                // Success payload: "staffId"
                staffAssignmentProducer.sendAssignmentSuccess(event.getSagaId(), staffId);
                log.info("Successfully assigned staff: {} for Saga: {}", staffId, event.getSagaId());
            } else {
                staffAssignmentProducer.sendAssignmentFailed(event.getSagaId(), "No staff available");
            }

        } catch (Exception ex) {
            log.error("Error processing staff assignment for Saga: {}", event.getSagaId(), ex);
            staffAssignmentProducer.sendAssignmentFailed(event.getSagaId(), "Internal error: " + ex.getMessage());
        }
    }
}
