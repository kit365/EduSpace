package com.eduspace.bookingservice.model.dto.integration;

import java.time.LocalTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomResponsePayload {
    private Integer id;
    /** Từ room-service RoomResponse.name — dùng email / UI. */
    private String name;
    private String status;
    private String approvalStatus;
    private Boolean isActive;
    private List<RoomSchedulePayload> schedules;

    @Getter
    @Setter
    public static class RoomSchedulePayload {
        private Integer dayOfWeek;
        private Boolean isOpen;
        private LocalTime openTime;
        private LocalTime closeTime;
    }
}
