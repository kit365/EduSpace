package com.eduspace.conversationservice.business.saga.handler;
import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.StaffAssignmentOfferEntity;
import com.eduspace.conversationservice.model.event.BaseEvent;
import com.eduspace.conversationservice.model.event.SagaEventConstants;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.StaffAssignmentOfferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class StaffAssignmentSagaHandler {
    private static final Logger log = LoggerFactory.getLogger(StaffAssignmentSagaHandler.class);

    /** Short waits before re-querying if the result arrived before commit (defense in depth). */
    private static final int[] RETRY_DELAYS_MS = { 50, 100, 150, 200 };

    private final ConversationRepository conversationRepository;
    private final StaffAssignmentOfferRepository offerRepository;
    private final ChatService chatService;
    private final SagaService sagaService;
    private final com.eduspace.conversationservice.business.service.OutboxService outboxService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public StaffAssignmentSagaHandler(
            ConversationRepository conversationRepository,
            StaffAssignmentOfferRepository offerRepository,
            ChatService chatService,
            SagaService sagaService,
            com.eduspace.conversationservice.business.service.OutboxService outboxService,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.offerRepository = offerRepository;
        this.chatService = chatService;
        this.sagaService = sagaService;
        this.outboxService = outboxService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void handleAssignmentResult(BaseEvent<String> event) {
        String sagaId = event.getSagaId();
        String result = event.getPayload();
        String eventType = event.getEventType();

        if (!SagaEventConstants.ASSIGN_STAFF_OFFERED.equals(eventType)
                && !SagaEventConstants.ASSIGN_STAFF_SUCCESS.equals(eventType)
                && !SagaEventConstants.ASSIGN_STAFF_FAILED.equals(eventType)) {
            log.warn("Unknown event type: {}", eventType);
            return;
        }

        Optional<ConversationEntity> conversationOpt = findConversationBySagaIdWithRetry(sagaId);
        if (conversationOpt.isEmpty()) {
            // Stale/out-of-order result: the saga/conversation may already be replaced by rematch.
            // Do not throw here, otherwise Kafka keeps retrying the same poison record and can
            // create unnecessary load that impacts API responsiveness.
            log.warn(
                    "assign-staff result dropped: no conversation for sagaId {} after {} lookup attempts (eventType={}).",
                    sagaId,
                    1 + RETRY_DELAYS_MS.length,
                    eventType);
            return;
        }

        ConversationEntity conversation = conversationOpt.get();

        if (SagaEventConstants.ASSIGN_STAFF_OFFERED.equals(eventType)) {
            handleOffered(conversation, sagaId, result);
            return;
        }

        if (SagaEventConstants.ASSIGN_STAFF_SUCCESS.equals(eventType)) {
            log.info("Staff assignment succeeded for conversation: {}. Assigned Staff: {}", conversation.getId(), result);
            conversation.setIsActive(true);
            conversation.setUser2Id(result);

            conversationRepository.save(conversation);

            emitAssignmentEvents(conversation);

            sagaService.completeSaga(sagaId);

        } else {
            log.error("Staff assignment failed for conversation: {}. Notifying user.", conversation.getId());
            try {
                conversation.setIsActive(false);
                conversationRepository.save(conversation);
                chatService.notifyStaffAssignmentFailed(conversation.getId(), result);
                emitAssignmentFailedEvents(conversation, result);
                sagaService.failSaga(sagaId, "Staff assignment failed");
            } catch (Exception e) {
                log.error("Failed to handle saga failure", e);
            }
        }
    }

    private void handleOffered(ConversationEntity conversation, String sagaId, String payload) {
        OfferedPayload offered = parseOfferedPayload(payload);
        if (offered == null) {
            sagaService.failSaga(sagaId, "Invalid ASSIGN_STAFF_OFFERED payload");
            return;
        }
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(offered.ttlSeconds());
        StaffAssignmentOfferEntity offer = new StaffAssignmentOfferEntity();
        offer.setId(offered.offerId());
        offer.setConversationId(conversation.getId());
        offer.setSagaId(sagaId);
        offer.setStaffId(offered.staffId());
        offer.setStatus(StaffAssignmentOfferEntity.Status.PENDING);
        offer.setExpiresAt(expiresAt);
        offerRepository.save(offer);

        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("type", "ASSIGNMENT_OFFER");
        eventPayload.put("conversationId", conversation.getId());
        eventPayload.put("offerId", offer.getId());
        eventPayload.put("expiresAt", expiresAt.toString());
        eventPayload.put("targetAdminId", offered.staffId());
        eventPayload.put("messageType", "SYSTEM");
        eventPayload.put("lastMessage", "Support request waiting for admin acceptance");
        eventPayload.put("lastActivity", LocalDateTime.now().toString());
        eventPayload.put("senderId", conversation.getUser1Id());
        eventPayload.put("isAdminConversation", true);

        String subPath = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.CONVERSATIONS;
        String topicAdmin = com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics.USER + offered.staffId() + subPath;
        messagingTemplate.convertAndSend(topicAdmin, eventPayload);
        log.info("Broadcasted assignment offer {} to admin {} for conversation {}", offer.getId(), offered.staffId(), conversation.getId());
    }

    private OfferedPayload parseOfferedPayload(String payload) {
        // Payload format: staffId|offerId|ttlSeconds
        if (payload == null || payload.isBlank()) {
            return null;
        }
        String[] parts = payload.split("\\|");
        if (parts.length < 1) {
            return null;
        }
        String staffId = parts[0];
        String offerId = parts.length > 1 && !parts[1].isBlank() ? parts[1] : UUID.randomUUID().toString();
        long ttlSeconds = 30L;
        if (parts.length > 2) {
            try {
                ttlSeconds = Math.max(5L, Long.parseLong(parts[2]));
            } catch (NumberFormatException ignored) {
                ttlSeconds = 30L;
            }
        }
        return new OfferedPayload(staffId, offerId, ttlSeconds);
    }

    private record OfferedPayload(String staffId, String offerId, long ttlSeconds) {}

    private Optional<ConversationEntity> findConversationBySagaIdWithRetry(String sagaId) {
        Optional<ConversationEntity> found = conversationRepository.findBySagaId(sagaId);
        if (found.isPresent()) {
            return found;
        }
        for (int i = 0; i < RETRY_DELAYS_MS.length; i++) {
            try {
                Thread.sleep(RETRY_DELAYS_MS[i]);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for conversation with saga {}", sagaId);
                return Optional.empty();
            }
            found = conversationRepository.findBySagaId(sagaId);
            if (found.isPresent()) {
                log.info("findBySagaId succeeded after {} ms wait for saga {}", RETRY_DELAYS_MS[i], sagaId);
                return found;
            }
        }
        return Optional.empty();
    }

    private void emitAssignmentEvents(ConversationEntity conversation) {
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

    private void emitAssignmentFailedEvents(ConversationEntity conversation, String reason) {
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
