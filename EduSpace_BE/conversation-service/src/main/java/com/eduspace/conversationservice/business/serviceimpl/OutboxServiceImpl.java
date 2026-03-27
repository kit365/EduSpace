package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.model.entity.OutboxEventEntity;
import com.eduspace.conversationservice.persistence.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutboxServiceImpl implements OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public OutboxServiceImpl(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void addEvent(String aggregateType, String aggregateId, String eventType, Object payload) {
        addEvent(aggregateType, aggregateId, eventType, payload, null);
    }

    @Override
    @Transactional
    public void addEvent(String aggregateType, String aggregateId, String eventType, Object payload, String targetUserId) {
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize outbox payload", e);
        }

        OutboxEventEntity event = new OutboxEventEntity();
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setEventType(eventType);
        event.setPayload(json);
        event.setStatus(OutboxEventEntity.Status.PENDING);
        event.setTargetUserId(targetUserId);
        outboxEventRepository.save(event);
    }
}

