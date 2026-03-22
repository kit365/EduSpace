package com.eduspace.accountservice.infrastructure.messaging.consumer;
 
import com.eduspace.accountservice.business.service.UserService;
import com.eduspace.accountservice.model.event.BaseEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
 
import java.util.Map;
 
@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationLoadConsumer {
 
    private final UserService userService;
    private final ObjectMapper objectMapper;
 
    @KafkaListener(
            topics = "${app.kafka.topics.conversation-events}",
            groupId = "${spring.kafka.consumer.group-id}-load-sync")
    public void consumeConversationEvent(String messageJson) {
        try {
            BaseEvent<Map<String, Object>> event = objectMapper.readValue(
                messageJson, 
                new TypeReference<BaseEvent<Map<String, Object>>>() {}
            );
 
            String eventType = event.getEventType();
            Map<String, Object> payload = event.getPayload();
 
            log.info("Received conversation event: {} for load syncing", eventType);
 
            switch (eventType) {
                case "CONVERSATION_ASSIGNED":
                    handleAssigned(payload);
                    break;
                case "STAFF_TRANSFERRED":
                    handleTransferred(payload);
                    break;
                case "CONVERSATION_CLOSED":
                    handleClosed(payload);
                    break;
                default:
                    // Ignore other events
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to process conversation load event: {}", messageJson, e);
        }
    }
 
    private void handleAssigned(Map<String, Object> payload) {
        String adminId = (String) payload.get("adminId");
        if (adminId != null) {
            userService.incrementActiveChatCount(adminId);
        }
    }
 
    private void handleTransferred(Map<String, Object> payload) {
        String fromAdminId = (String) payload.get("fromAdminId");
        String toAdminId = (String) payload.get("toAdminId");
 
        if (fromAdminId != null) {
            userService.decrementActiveChatCount(fromAdminId);
        }
        if (toAdminId != null) {
            userService.incrementActiveChatCount(toAdminId);
        }
    }
 
    private void handleClosed(Map<String, Object> payload) {
        String adminId = (String) payload.get("adminId");
        if (adminId != null) {
            userService.decrementActiveChatCount(adminId);
        }
    }
}
