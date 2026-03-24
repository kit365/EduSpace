package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.common.enums.DurationMode;
import com.eduspace.roomservice.common.enums.RoomTimeslotType;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTimeslotResponse {
    Long id;
    Integer dayOfWeek;
    RoomTimeslotType slotType;
    LocalTime startTime;
    LocalTime endTime;
    DurationMode durationMode;
    Integer durationStep;
    Boolean isActive;
}
