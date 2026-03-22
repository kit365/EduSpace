package com.eduspace.conversationservice.model.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BaseEventRequest<T> {
    private String sagaId;       // Khóa chính của chuỗi Saga
    private String eventType;    // Tên sự kiện (VD: ASSIGN_STAFF_REQUEST)
    private String source;       // Ai bắn ra (VD: chat-service)
    private LocalDateTime timestamp;
    private T payload;           // Dữ liệu lõi (Gói data tùy biến)
}
