package com.eduspace.roomservice.common.enums;

/**
 * Trạng thái vận hành / vật lý của phòng (dashboard host).
 * ACTIVE / INACTIVE: giá trị cũ, tương thích dữ liệu đã có.
 */
public enum RoomStatus {
    READY,
    IN_USE,
    CLEANING,
    MAINTENANCE,
    ACTIVE,
    INACTIVE
}
