package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface RoomValidationService {

    /**
     * Kiểm tra phòng có thể đặt trong khung giờ; trả về payload phòng (dùng cho mail / hiển thị).
     */
    RoomResponsePayload validateRoomBookableAndGetRoom(
            Long roomId, LocalDate bookingDate, LocalDateTime startDateTime, LocalDateTime endDateTime);
}
