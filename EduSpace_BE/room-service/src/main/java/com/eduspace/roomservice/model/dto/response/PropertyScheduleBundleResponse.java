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

    /**
     * Alias cho {@link #bufferMinutes} để đồng bộ naming với FE/UI.
     * Nếu client dùng `bufferTime`, BE sẽ trả về giá trị tương đương.
     */
    Integer bufferTime;

    /** True: tạo slot có thể dùng mọi khung trong ngày (24h). */
    Boolean isOverDay;

    List<RoomScheduleResponse> schedules;
}
