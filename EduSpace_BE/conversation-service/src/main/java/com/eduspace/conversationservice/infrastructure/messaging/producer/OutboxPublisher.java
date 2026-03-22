package com.eduspace.conversationservice.infrastructure.messaging.producer;

import com.eduspace.conversationservice.model.entity.OutboxEventEntity;
import com.eduspace.conversationservice.persistence.repository.OutboxEventRepository;
import com.eduspace.conversationservice.infrastructure.config.messaging_kafka.KafkaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
@ConditionalOnProperty(name = "app.outbox.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisher {

    private static final int BATCH_SIZE = 50;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final KafkaProperties kafkaProperties;

    @Scheduled(fixedDelayString = "${app.outbox.publisher-delay-ms:2000}")
    @Transactional
    public void publishPending() {
        List<OutboxEventEntity> pending = outboxEventRepository.findPublishable(
                OutboxEventEntity.Status.PENDING,
                LocalDateTime.now(),
                PageRequest.of(0, BATCH_SIZE)
        );
        if (pending.isEmpty()) return;

        for (OutboxEventEntity event : pending) {
            try {
                // For now we route all conversation events to one topic; consumers can branch by event_type.
                String topic = kafkaProperties.getConversationEvents();
                kafkaTemplate.send(topic, event.getAggregateId(), buildEnvelope(event));

                event.setStatus(OutboxEventEntity.Status.SENT);
                event.setSentAt(LocalDateTime.now());
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError(null);
            } catch (Exception ex) {
                log.error("Failed to publish outbox event id={}", event.getId(), ex);
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError(ex.getMessage());
                if (event.getAttempts() >= 10) {
                    event.setStatus(OutboxEventEntity.Status.FAILED);
                }
            }
        }

        outboxEventRepository.saveAll(pending);
    }

    private String buildEnvelope(OutboxEventEntity event) {
        // Keep as String envelope to avoid forcing a JSON serializer config here.
        // Format: {"eventType":"...","aggregateType":"...","aggregateId":"...","payload":<json>}
        return "{"
                + "\"eventType\":\"" + escape(event.getEventType()) + "\","
                + "\"aggregateType\":\"" + escape(event.getAggregateType()) + "\","
                + "\"aggregateId\":\"" + escape(event.getAggregateId()) + "\","
                + "\"payload\":" + event.getPayload()
                + "}";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

