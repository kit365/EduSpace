package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomScheduleItemRequest;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomScheduleEntity;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.eduspace.roomservice.persistence.repository.RoomScheduleRepository;
import java.time.LocalTime;
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
public class RoomScheduleServiceImpl implements RoomScheduleService {

    private final RoomRepository roomRepository;
    private final RoomScheduleRepository roomScheduleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomScheduleResponse> listByRoomId(Integer roomId) {
        return roomScheduleRepository.findByRoomIdOrderByDayOfWeekAsc(roomId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void replaceSchedules(Integer roomId, String ownerId, List<RoomScheduleItemRequest> items) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null || !ownerId.trim().equals(room.getProperty().getOwnerId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        validateScheduleItems(items);
        roomScheduleRepository.deleteByRoomId(roomId);
        // Bắt buộc flush DELETE trước INSERT để tránh trùng (room_id, day_of_week) trong cùng transaction.
        roomScheduleRepository.flush();
        List<RoomScheduleEntity> toSave = new ArrayList<>();
        for (RoomScheduleItemRequest it : items) {
            RoomScheduleEntity e = RoomScheduleEntity.builder()
                    .roomId(roomId)
                    .dayOfWeek(it.getDayOfWeek())
                    .isOpen(Boolean.TRUE.equals(it.getIsOpen()))
                    .openTime(Boolean.TRUE.equals(it.getIsOpen()) ? it.getOpenTime() : null)
                    .closeTime(Boolean.TRUE.equals(it.getIsOpen()) ? it.getCloseTime() : null)
                    .build();
            toSave.add(e);
        }
        toSave.sort(Comparator.comparing(RoomScheduleEntity::getDayOfWeek));
        roomScheduleRepository.saveAll(toSave);
    }

    @Override
    @Transactional
    public void seedDefaultsForNewRoom(Integer roomId) {
        if (!roomScheduleRepository.findByRoomIdOrderByDayOfWeekAsc(roomId).isEmpty()) {
            return;
        }
        RoomEntity room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        boolean is247 = Boolean.TRUE.equals(room.getIs24_7());
        List<RoomScheduleEntity> rows = new ArrayList<>();
        LocalTime o = LocalTime.of(7, 0);
        LocalTime c = LocalTime.of(22, 0);
        LocalTime o247 = LocalTime.MIDNIGHT;
        LocalTime c247 = LocalTime.of(23, 59);
        for (int d = 2; d <= 8; d++) {
            if (is247) {
                rows.add(RoomScheduleEntity.builder()
                        .roomId(roomId)
                        .dayOfWeek(d)
                        .isOpen(true)
                        .openTime(o247)
                        .closeTime(c247)
                        .build());
            } else {
                boolean open = d <= 7;
                rows.add(RoomScheduleEntity.builder()
                        .roomId(roomId)
                        .dayOfWeek(d)
                        .isOpen(open)
                        .openTime(open ? o : null)
                        .closeTime(open ? c : null)
                        .build());
            }
        }
        roomScheduleRepository.saveAll(rows);
    }

    private void validateScheduleItems(List<RoomScheduleItemRequest> items) {
        if (items == null || items.size() != 7) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Set<Integer> seen = new HashSet<>();
        for (RoomScheduleItemRequest it : items) {
            if (it.getDayOfWeek() == null || it.getDayOfWeek() < 2 || it.getDayOfWeek() > 8) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            if (!seen.add(it.getDayOfWeek())) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            boolean open = Boolean.TRUE.equals(it.getIsOpen());
            if (open) {
                if (it.getOpenTime() == null || it.getCloseTime() == null) {
                    throw new AppException(ErrorCode.INVALID_KEY);
                }
                if (!it.getOpenTime().isBefore(it.getCloseTime())) {
                    throw new AppException(ErrorCode.INVALID_KEY);
                }
            }
        }
        if (seen.size() != 7) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private RoomScheduleResponse toResponse(RoomScheduleEntity e) {
        return RoomScheduleResponse.builder()
                .id(e.getId())
                .dayOfWeek(e.getDayOfWeek())
                .isOpen(e.getIsOpen())
                .openTime(e.getOpenTime())
                .closeTime(e.getCloseTime())
                .build();
    }
}
