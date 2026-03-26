package com.eduspace.roomservice.model.dto.response;

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
public class RoomScheduleResponse {

    Long id;
    Integer dayOfWeek;
    Boolean isOpen;
    Boolean isOverDay;
    LocalTime openTime;
    LocalTime closeTime;
}
