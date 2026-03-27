package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.BlockType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBlockRequest {

    /** Cơ sở (chi nhánh) — ưu tiên khi tạo/cập nhật lịch chặn. */
    Integer propertyId;

    /** Tương thích cũ: suy ra property từ phòng nếu không gửi propertyId. */
    Integer roomId;

    LocalDateTime startDatetime;
    LocalDateTime endDatetime;
    String reason;
    BlockType blockType;
    String createdBy;
}
