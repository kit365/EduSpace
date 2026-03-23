package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomTimeslotService;
import com.eduspace.roomservice.common.enums.DurationMode;
import com.eduspace.roomservice.common.enums.RoomTimeslotType;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomAvailabilityCheckRequest;
import com.eduspace.roomservice.model.dto.request.RoomPricingQuoteRequest;
import com.eduspace.roomservice.model.dto.request.RoomTimeslotItemRequest;
import com.eduspace.roomservice.model.dto.response.RoomAvailabilityCheckResponse;
import com.eduspace.roomservice.model.dto.response.RoomPricingQuoteResponse;
import com.eduspace.roomservice.model.dto.response.RoomTimeslotResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomTimeslotEntity;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.eduspace.roomservice.persistence.repository.RoomTimeslotRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomTimeslotServiceImpl implements RoomTimeslotService {

    private final RoomRepository roomRepository;
    private final RoomTimeslotRepository roomTimeslotRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomTimeslotResponse> listByRoomAndDate(Integer roomId, LocalDate bookingDate) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        int dayOfWeek = mapDayOfWeek(bookingDate);
        List<RoomTimeslotEntity> slots = roomTimeslotRepository.findByRoomIdAndDayOfWeekAndIsActiveTrueOrderByStartTimeAsc(
                room.getId(), dayOfWeek);
        return slots.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomTimeslotResponse> listByRoom(Integer roomId) {
        return roomTimeslotRepository.findByRoomIdOrderByDayOfWeekAscStartTimeAsc(roomId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void replaceTimeslots(Integer roomId, String ownerId, List<RoomTimeslotItemRequest> items) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null || !ownerId.trim().equals(room.getProperty().getOwnerId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        validateTimeslotItems(items);
        roomTimeslotRepository.deleteByRoomId(roomId);
        roomTimeslotRepository.flush();

        List<RoomTimeslotEntity> toSave = new ArrayList<>();
        for (RoomTimeslotItemRequest item : items) {
            toSave.add(RoomTimeslotEntity.builder()
                    .roomId(roomId)
                    .dayOfWeek(item.getDayOfWeek())
                    .slotType(item.getSlotType().name())
                    .startTime(item.getStartTime())
                    .endTime(item.getEndTime())
                    .durationMode(item.getDurationMode().name())
                    .durationStep(item.getDurationStep())
                    .isActive(item.getIsActive() == null || item.getIsActive())
                    .build());
        }
        toSave.sort(Comparator.comparing(RoomTimeslotEntity::getDayOfWeek).thenComparing(RoomTimeslotEntity::getStartTime));
        roomTimeslotRepository.saveAll(toSave);
    }

    @Override
    @Transactional
    public void seedDefaultsForNewRoom(Integer roomId) {
        if (!roomTimeslotRepository.findByRoomIdOrderByDayOfWeekAscStartTimeAsc(roomId).isEmpty()) {
            return;
        }
        List<RoomTimeslotEntity> defaults = new ArrayList<>();
        for (int day = 2; day <= 8; day++) {
            defaults.add(RoomTimeslotEntity.builder()
                    .roomId(roomId)
                    .dayOfWeek(day)
                    .slotType(RoomTimeslotType.DAY.name())
                    .startTime(java.time.LocalTime.of(8, 0))
                    .endTime(java.time.LocalTime.of(18, 0))
                    .durationMode(DurationMode.HOUR.name())
                    .durationStep(1)
                    .isActive(true)
                    .build());
            defaults.add(RoomTimeslotEntity.builder()
                    .roomId(roomId)
                    .dayOfWeek(day)
                    .slotType(RoomTimeslotType.SESSION.name())
                    .startTime(java.time.LocalTime.of(18, 0))
                    .endTime(java.time.LocalTime.of(22, 0))
                    .durationMode(DurationMode.MINUTE.name())
                    .durationStep(30)
                    .isActive(true)
                    .build());
        }
        roomTimeslotRepository.saveAll(defaults);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomAvailabilityCheckResponse checkAvailability(Integer roomId, RoomAvailabilityCheckRequest request) {
        RoomPricingQuoteResponse quote = quote(roomId, RoomPricingQuoteRequest.builder()
                .slotId(request.getSlotId())
                .bookingDate(request.getBookingDate())
                .durationValue(request.getDurationValue())
                .durationUnit(request.getDurationUnit())
                .build());

        return RoomAvailabilityCheckResponse.builder()
                .available(true)
                .reason("AVAILABLE")
                .startDateTime(quote.getStartDateTime())
                .endDateTime(quote.getEndDateTime())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomPricingQuoteResponse quote(Integer roomId, RoomPricingQuoteRequest request) {
        if (request == null || request.getSlotId() == null || request.getBookingDate() == null
                || request.getDurationValue() == null || request.getDurationValue() <= 0 || request.getDurationUnit() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        RoomTimeslotEntity slot = roomTimeslotRepository.findById(request.getSlotId())
                .filter(s -> s.getRoomId().equals(roomId) && Boolean.TRUE.equals(s.getIsActive()))
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        int expectedDay = mapDayOfWeek(request.getBookingDate());
        if (!slot.getDayOfWeek().equals(expectedDay)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        int requestedMinutes = toMinutes(request.getDurationValue(), request.getDurationUnit());
        int slotDurationMinutes = (int) java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
        if (requestedMinutes <= 0 || requestedMinutes > slotDurationMinutes) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        DurationMode slotMode = DurationMode.valueOf(slot.getDurationMode());
        int stepMinutes = slotMode == DurationMode.MINUTE ? slot.getDurationStep() : slot.getDurationStep() * 60;
        if (requestedMinutes % stepMinutes != 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        BigDecimal hourlyPrice = room.getPricePerHour() == null ? BigDecimal.ZERO : room.getPricePerHour();
        BigDecimal minuteUnitPrice = hourlyPrice.divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        BigDecimal unitPrice = request.getDurationUnit() == DurationMode.MINUTE ? minuteUnitPrice : hourlyPrice;
        BigDecimal totalPrice = request.getDurationUnit() == DurationMode.MINUTE
                ? minuteUnitPrice.multiply(BigDecimal.valueOf(request.getDurationValue()))
                : hourlyPrice.multiply(BigDecimal.valueOf(request.getDurationValue()));

        LocalDateTime startDateTime = LocalDateTime.of(request.getBookingDate(), slot.getStartTime());
        LocalDateTime endDateTime = startDateTime.plusMinutes(requestedMinutes);

        return RoomPricingQuoteResponse.builder()
                .slotId(slot.getId())
                .durationMinutes(requestedMinutes)
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .startDateTime(startDateTime)
                .endDateTime(endDateTime)
                .currency("VND")
                .build();
    }

    private void validateTimeslotItems(List<RoomTimeslotItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Set<Integer> seenDays = new HashSet<>();
        for (RoomTimeslotItemRequest item : items) {
            if (item.getDayOfWeek() == null || item.getDayOfWeek() < 2 || item.getDayOfWeek() > 8
                    || item.getSlotType() == null
                    || item.getStartTime() == null || item.getEndTime() == null
                    || !item.getStartTime().isBefore(item.getEndTime())
                    || item.getDurationMode() == null
                    || item.getDurationStep() == null || item.getDurationStep() <= 0) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            seenDays.add(item.getDayOfWeek());
        }
        if (seenDays.size() < 1) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private RoomTimeslotResponse toResponse(RoomTimeslotEntity entity) {
        return RoomTimeslotResponse.builder()
                .id(entity.getId())
                .dayOfWeek(entity.getDayOfWeek())
                .slotType(RoomTimeslotType.valueOf(entity.getSlotType()))
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .durationMode(DurationMode.valueOf(entity.getDurationMode()))
                .durationStep(entity.getDurationStep())
                .isActive(entity.getIsActive())
                .build();
    }

    private int mapDayOfWeek(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day.getValue() + 1;
    }

    private int toMinutes(int value, DurationMode mode) {
        return mode == DurationMode.MINUTE ? value : value * 60;
    }
}
