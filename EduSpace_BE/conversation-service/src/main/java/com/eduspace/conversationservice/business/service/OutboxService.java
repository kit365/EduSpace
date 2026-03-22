package com.eduspace.conversationservice.business.service;

public interface OutboxService {
    void addEvent(String aggregateType, String aggregateId, String eventType, Object payload);
    void addEvent(String aggregateType, String aggregateId, String eventType, Object payload, String targetUserId);
}

