package com.eduspace.accountservice.model.event;

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
}
