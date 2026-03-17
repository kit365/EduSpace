package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.RoomSlotStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomSlotRequest {

    Integer roomId;
    String name;
    LocalTime startTime;
    LocalTime endTime;
    String dayOfWeek;
    Long basePrice;
    RoomSlotStatus status;
}
