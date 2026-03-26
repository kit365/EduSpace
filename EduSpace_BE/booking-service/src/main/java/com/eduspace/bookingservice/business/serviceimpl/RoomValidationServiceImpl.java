package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.model.dto.integration.ApiWrapper;
import com.eduspace.bookingservice.model.dto.integration.RoomBlockPayload;
import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import com.eduspace.bookingservice.model.entity.TimeSlotEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class RoomValidationServiceImpl implements RoomValidationService {

    private static final Set<String> OPEN_STATUSES = Set.of("READY", "ACTIVE");
    private final RestTemplate restTemplate;

    @Value("${integration.room-service.base-url:http://localhost:8083}")
    private String roomServiceBaseUrl;

    @Override
    public void validateRoomBookable(Long roomId, LocalDate bookingDate, List<TimeSlotEntity> requestedSlots) {
        RoomResponsePayload room = fetchRoom(roomId);
        validateRoomFlags(room);
        validateSchedule(room, bookingDate, requestedSlots);
        validateNoActiveMaintenanceBlocks(roomId, bookingDate, requestedSlots);
    }

    private RoomResponsePayload fetchRoom(Long roomId) {
        String url = roomServiceBaseUrl + "/api/v1/public/rooms/" + roomId;
        ResponseEntity<ApiWrapper<RoomResponsePayload>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        ApiWrapper<RoomResponsePayload> body = response.getBody();
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

    private void validateSchedule(RoomResponsePayload room, LocalDate bookingDate, List<TimeSlotEntity> requestedSlots) {
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

        LocalTime openTime = schedule.getOpenTime();
        LocalTime closeTime = schedule.getCloseTime();
        for (TimeSlotEntity slot : requestedSlots) {
            boolean outOfRange = slot.getStartTime().isBefore(openTime) || slot.getEndTime().isAfter(closeTime);
            if (outOfRange) {
                throw new IllegalArgumentException("Selected slot is outside room opening hours");
            }
        }
    }

    private void validateNoActiveMaintenanceBlocks(Long roomId, LocalDate bookingDate, List<TimeSlotEntity> requestedSlots) {
        if (requestedSlots.isEmpty()) {
            return;
        }
        String url = roomServiceBaseUrl + "/api/v1/room-blocks?roomId=" + roomId;
        ResponseEntity<ApiWrapper<List<RoomBlockPayload>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        ApiWrapper<List<RoomBlockPayload>> body = response.getBody();
        List<RoomBlockPayload> blocks = body == null || body.getData() == null ? List.of() : body.getData();

        for (TimeSlotEntity slot : requestedSlots) {
            LocalDateTime slotStart = LocalDateTime.of(bookingDate, slot.getStartTime());
            LocalDateTime slotEnd = LocalDateTime.of(bookingDate, slot.getEndTime());
            boolean blocked = blocks.stream()
                    .filter(b -> "MAINTENANCE".equalsIgnoreCase(b.getBlockType()))
                    .anyMatch(block -> overlaps(slotStart, slotEnd, block.getStartDateTime(), block.getEndDateTime()));
            if (blocked) {
                throw new IllegalArgumentException("Room is under maintenance in selected slot");
            }
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
