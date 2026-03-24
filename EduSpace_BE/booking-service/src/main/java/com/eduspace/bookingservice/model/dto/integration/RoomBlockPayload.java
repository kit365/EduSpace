package com.eduspace.bookingservice.model.dto.integration;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomBlockPayload {
    private Integer roomId;
    private String blockType;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
