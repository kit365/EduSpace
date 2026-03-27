package com.eduspace.conversationservice.model.event;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaseEvent<T> {
    private String sagaId;         // ID của Saga để track luồng
    private String eventType;      // Loại sự kiện (VD: ASSIGN_STAFF_REQUEST)
    private LocalDateTime timestamp;
    private T payload;             // Ruột của tin nhắn (Chứa data linh hoạt)

    // Explicit accessors to compile even when Lombok annotation processing is disabled.
    public String getSagaId() {
        return sagaId;
    }

    public void setSagaId(String sagaId) {
        this.sagaId = sagaId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }
}
