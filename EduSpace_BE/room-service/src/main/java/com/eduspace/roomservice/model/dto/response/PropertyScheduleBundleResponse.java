package com.eduspace.roomservice.model.dto.response;

import java.util.List;
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
public class PropertyScheduleBundleResponse {

    /** Phút nghỉ giữa các khung giờ liên tiếp (turnover). */
    Integer bufferMinutes;

    /** True: tạo slot có thể dùng mọi khung trong ngày (24h). */
    Boolean isOverDay;

    List<RoomScheduleResponse> schedules;
}
