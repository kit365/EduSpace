package com.eduspace.conversationservice.business.saga.handler;
import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.model.event.BaseEvent;
import com.eduspace.conversationservice.model.event.SagaEventConstants;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StaffAssignmentSagaHandler {

    private final ConversationRepository conversationRepository;
    private final ChatService chatService;
    private final SagaService sagaService;
    private final com.eduspace.conversationservice.business.service.OutboxService outboxService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void handleAssignmentResult(BaseEvent<String> event) {
        String sagaId = event.getSagaId();
        String result = event.getPayload();
        
        conversationRepository.findBySagaId(sagaId).ifPresent(conversation -> {
            if (SagaEventConstants.ASSIGN_STAFF_SUCCESS.equals(event.getEventType())) {
                log.info("Staff assignment succeeded for conversation: {}. Assigned Staff: {}", conversation.getId(), result);
                conversation.setIsActive(true);
                conversation.setUser2Id(result); // result is the staffId from the event payload

                conversationRepository.save(conversation);
                
                // Notify BOTH participants (Customer and newly assigned Admin)
                emitAssignmentEvents(conversation);
                
                sagaService.completeSaga(sagaId);

            } else if (SagaEventConstants.ASSIGN_STAFF_FAILED.equals(event.getEventType())) {
                log.error("Staff assignment failed for conversation: {}. Notifying user.", conversation.getId());
                try {
                    // Compensation: keep support thread but mark it inactive/unassigned.
                    conversation.setIsActive(false);
                    conversationRepository.save(conversation);
                    chatService.notifyStaffAssignmentFailed(conversation.getId(), result);
                    emitAssignmentFailedEvents(conversation, result);
                    sagaService.failSaga(sagaId, "Staff assignment failed");
                } catch (Exception e) {
                    log.error("Failed to handle saga failure", e);
                }
            }
        });

        if (!SagaEventConstants.ASSIGN_STAFF_SUCCESS.equals(event.getEventType()) && 
            !SagaEventConstants.ASSIGN_STAFF_FAILED.equals(event.getEventType())) {
            log.warn("Unknown event type: {}", event.getEventType());
        }
    }

    private void emitAssignmentEvents(com.eduspace.conversationservice.model.entity.ConversationEntity conversation) {
        String subPath = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.CONVERSATIONS;
        String topicUser1 = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.USER + conversation.getUser1Id() + subPath;
        String topicUser2 = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.USER + conversation.getUser2Id() + subPath;

        java.util.Map<String, Object> eventPayload = new java.util.HashMap<>();
        eventPayload.put("type", "CONVERSATION_ACTIVITY");
        eventPayload.put("conversationId", conversation.getId());
        eventPayload.put("lastMessage", "Staff assigned");
        eventPayload.put("lastActivity", java.time.LocalDateTime.now().toString());
        eventPayload.put("isAdminConversation", true);
        eventPayload.put("senderId", conversation.getUser2Id());
        eventPayload.put("messageType", "SYSTEM");

        // Direct WebSocket broadcast for immediate UI update
        try {
            messagingTemplate.convertAndSend(topicUser1, eventPayload);
            messagingTemplate.convertAndSend(topicUser2, eventPayload);
            
            log.info("Broadcasted staff assignment to WebSocket users: {} and {}", conversation.getUser1Id(), conversation.getUser2Id());
        } catch (Exception e) {
            log.error("Failed to broadcast staff assignment to WebSockets", e);
        }

        // Notify Customer (Outbox for persistence)
        outboxService.addEvent(
            com.eduspace.conversationservice.model.event.DomainEventConstants.AGGREGATE_CONVERSATION,
            conversation.getId(),
            "CONVERSATION_ACTIVITY",
            eventPayload,
            conversation.getUser1Id()
        );

        // Notify Admin (Outbox for persistence)
        outboxService.addEvent(
            com.eduspace.conversationservice.model.event.DomainEventConstants.AGGREGATE_CONVERSATION,
            conversation.getId(),
            "CONVERSATION_ACTIVITY",
            eventPayload,
            conversation.getUser2Id()
        );
    }

    private void emitAssignmentFailedEvents(com.eduspace.conversationservice.model.entity.ConversationEntity conversation, String reason) {
        String subPath = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.CONVERSATIONS;
        String topicUser1 = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.USER + conversation.getUser1Id() + subPath;

        String msg = "No staff available";
        if (reason != null && !reason.isBlank()) {
            msg = msg + ": " + reason;
        }

        java.util.Map<String, Object> eventPayload = new java.util.HashMap<>();
        eventPayload.put("type", "CONVERSATION_ACTIVITY");
        eventPayload.put("conversationId", conversation.getId());
        eventPayload.put("lastMessage", msg);
        eventPayload.put("lastActivity", java.time.LocalDateTime.now().toString());
        eventPayload.put("isAdminConversation", true);
        eventPayload.put("senderId", conversation.getUser1Id());
        eventPayload.put("messageType", "SYSTEM");

        try {
            messagingTemplate.convertAndSend(topicUser1, eventPayload);
            log.info("Broadcasted staff-assignment failure to WebSocket user: {}", conversation.getUser1Id());
        } catch (Exception e) {
            log.error("Failed to broadcast staff-assignment failure to WebSocket", e);
        }

        outboxService.addEvent(
            com.eduspace.conversationservice.model.event.DomainEventConstants.AGGREGATE_CONVERSATION,
            conversation.getId(),
            "CONVERSATION_ACTIVITY",
            eventPayload,
            conversation.getUser1Id()
        );
    }
}
