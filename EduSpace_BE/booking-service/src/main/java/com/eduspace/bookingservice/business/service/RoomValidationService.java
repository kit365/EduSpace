package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.entity.TimeSlotEntity;
import java.time.LocalDate;
import java.util.List;

public interface RoomValidationService {
    void validateRoomBookable(Long roomId, LocalDate bookingDate, List<TimeSlotEntity> requestedSlots);
}
