package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.infrastructure.client.RoomServiceClient;
import com.eduspace.bookingservice.model.dto.integration.ApiWrapper;
import com.eduspace.bookingservice.model.dto.integration.RoomBlockPayload;
import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomValidationServiceImpl implements RoomValidationService {

    private static final Set<String> OPEN_STATUSES = Set.of("READY", "ACTIVE");
    private final RoomServiceClient roomServiceClient;

    @Override
    public RoomResponsePayload validateRoomBookableAndGetRoom(
            Long roomId,
            LocalDate bookingDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        RoomResponsePayload room = fetchRoom(roomId);
        validateRoomFlags(room);
        validateSchedule(room, bookingDate, startDateTime, endDateTime);
        validateNoActiveMaintenanceBlocks(roomId, bookingDate, startDateTime, endDateTime);
        return room;
    }

    private RoomResponsePayload fetchRoom(Long roomId) {
        ApiWrapper<RoomResponsePayload> body = roomServiceClient.getPublicRoom(roomId);
        if (body == null || body.getData() == null) {
            throw new IllegalArgumentException("Room not found: " + roomId);
        }
        return body.getData();
    }

    private void validateRoomFlags(RoomResponsePayload room) {
        if (!"APPROVED".equalsIgnoreCase(room.getApprovalStatus())) {
            throw new IllegalArgumentException("Room is not approved for booking");
        }
        if (Boolean.FALSE.equals(room.getIsActive())) {
            throw new IllegalArgumentException("Room is inactive");
        }
        if (room.getStatus() == null || !OPEN_STATUSES.contains(room.getStatus().toUpperCase())) {
            throw new IllegalArgumentException("Room is currently closed for booking");
        }
    }

    private void validateSchedule(
            RoomResponsePayload room,
            LocalDate bookingDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        if (room.getSchedules() == null || room.getSchedules().isEmpty()) {
            throw new IllegalArgumentException("Room has no schedule configured");
        }
        int dayOfWeek = bookingDate.getDayOfWeek().getValue() + 1;
        RoomResponsePayload.RoomSchedulePayload schedule = room.getSchedules().stream()
                .filter(item -> item.getDayOfWeek() != null && item.getDayOfWeek() == dayOfWeek)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Room schedule not found for selected date"));

        if (!Boolean.TRUE.equals(schedule.getIsOpen())) {
            throw new IllegalArgumentException("Room is closed on the selected date");
        }

        if (startDateTime == null || endDateTime == null) {
            throw new IllegalArgumentException("Missing start/end time");
        }
        LocalTime openTime = schedule.getOpenTime();
        LocalTime closeTime = schedule.getCloseTime();
        if (openTime == null || closeTime == null) {
            throw new IllegalArgumentException("Room opening hours are not configured for the selected day");
        }
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();
        boolean outOfRange = startTime.isBefore(openTime) || endTime.isAfter(closeTime) || !endTime.isAfter(startTime);
        if (outOfRange) {
            throw new IllegalArgumentException("Selected time range is outside room opening hours");
        }
    }

    private void validateNoActiveMaintenanceBlocks(
            Long roomId,
            LocalDate bookingDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {
        ApiWrapper<List<RoomBlockPayload>> body = roomServiceClient.listRoomBlocks(roomId.intValue());
        List<RoomBlockPayload> blocks = body == null || body.getData() == null ? List.of() : body.getData();
        boolean blocked = blocks.stream()
                .filter(b -> "MAINTENANCE".equalsIgnoreCase(b.getBlockType()))
                .anyMatch(block -> overlaps(startDateTime, endDateTime, block.getStartDateTime(), block.getEndDateTime()));
        if (blocked) {
            throw new IllegalArgumentException("Room is under maintenance in selected time range");
        }
    }

    private boolean overlaps(
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd,
            LocalDateTime blockStart,
            LocalDateTime blockEnd) {
        if (blockStart == null || blockEnd == null) {
            return false;
        }
        return requestedStart.isBefore(blockEnd) && requestedEnd.isAfter(blockStart);
    }
}
