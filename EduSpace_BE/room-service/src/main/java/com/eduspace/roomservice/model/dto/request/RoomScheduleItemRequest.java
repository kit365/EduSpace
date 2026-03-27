package com.eduspace.roomservice.model.dto.request;

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
public class RoomScheduleItemRequest {

    /** 2 = Thứ 2 … 8 = Chủ nhật */
    Integer dayOfWeek;
    Boolean isOpen;
    Boolean isOverDay;
    LocalTime openTime;
    LocalTime closeTime;
}
