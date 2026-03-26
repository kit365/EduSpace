package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.PropertyScheduleReplaceRequest;
import com.eduspace.roomservice.model.dto.request.RoomScheduleItemRequest;
import com.eduspace.roomservice.model.dto.response.PropertyScheduleBundleResponse;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomScheduleEntity;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
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
    private static final LocalTime OVER_DAY_OPEN_TIME = LocalTime.MIDNIGHT;
    private static final LocalTime OVER_DAY_CLOSE_TIME = LocalTime.of(23, 59);

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final RoomScheduleRepository roomScheduleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomScheduleResponse> listByRoomId(Integer roomId) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        return listByPropertyId(room.getProperty().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomScheduleResponse> listByPropertyId(Integer propertyId) {
        return roomScheduleRepository.findByProperty_IdOrderByDayOfWeekAsc(propertyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyScheduleBundleResponse getScheduleBundleByPropertyId(Integer propertyId) {
        PropertyEntity p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        List<RoomScheduleResponse> schedules = roomScheduleRepository.findByProperty_IdOrderByDayOfWeekAsc(propertyId).stream()
                .map(this::toResponse)
                .toList();
        return PropertyScheduleBundleResponse.builder()
                .bufferMinutes(p.getScheduleBufferMinutes() != null ? p.getScheduleBufferMinutes() : 0)
                .isOverDay(Boolean.TRUE.equals(p.getScheduleIsOverDay()))
                .schedules(schedules)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public void assertPropertyOwner(Integer propertyId, String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (!ownerId.trim().equals(property.getOwnerId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    @Override
    @Transactional
    public void replaceSchedules(Integer roomId, String ownerId, List<RoomScheduleItemRequest> items) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        replaceSchedulesForProperty(room.getProperty().getId(), ownerId, items);
    }

    @Override
    @Transactional
    public void replaceSchedulesForProperty(Integer propertyId, String ownerId, List<RoomScheduleItemRequest> items) {
        assertPropertyOwner(propertyId, ownerId);
        validateScheduleItems(items);
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        persistScheduleRows(property, items);
    }

    @Override
    @Transactional
    public void replacePropertyScheduleBundle(Integer propertyId, String ownerId, PropertyScheduleReplaceRequest request) {
        assertPropertyOwner(propertyId, ownerId);
        validateScheduleItems(request.getSchedules());
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        int bm = request.getBufferMinutes();
        if (bm < 0 || bm > 24 * 60) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        property.setScheduleBufferMinutes(bm);
        property.setScheduleIsOverDay(request.getIsOverDay());
        propertyRepository.save(property);
        persistScheduleRows(property, request.getSchedules());
    }

    private void persistScheduleRows(PropertyEntity property, List<RoomScheduleItemRequest> items) {
        Integer propertyId = property.getId();
        roomScheduleRepository.deleteByProperty_Id(propertyId);
        roomScheduleRepository.flush();
        List<RoomScheduleEntity> toSave = new ArrayList<>();
        for (RoomScheduleItemRequest it : items) {
            boolean isOpen = Boolean.TRUE.equals(it.getIsOpen());
            boolean isOverDay = Boolean.TRUE.equals(it.getIsOverDay());
            RoomScheduleEntity e = RoomScheduleEntity.builder()
                    .property(property)
                    .dayOfWeek(it.getDayOfWeek())
                    .isOpen(isOpen)
                    .isOverDay(isOverDay)
                    .openTime(
                            isOpen
                                    ? (isOverDay ? OVER_DAY_OPEN_TIME : it.getOpenTime())
                                    : null)
                    .closeTime(
                            isOpen
                                    ? (isOverDay ? OVER_DAY_CLOSE_TIME : it.getCloseTime())
                                    : null)
                    .build();
            toSave.add(e);
        }
        toSave.sort(Comparator.comparing(RoomScheduleEntity::getDayOfWeek));
        roomScheduleRepository.saveAll(toSave);
    }

    @Override
    @Transactional
    public void seedDefaultsForNewRoom(Integer roomId) {
        RoomEntity room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        Integer propertyId = room.getProperty().getId();
        if (roomScheduleRepository.existsByProperty_Id(propertyId)) {
            return;
        }
        boolean is247 = Boolean.TRUE.equals(room.getIs24_7());
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        List<RoomScheduleEntity> rows = new ArrayList<>();
        LocalTime o = LocalTime.of(7, 0);
        LocalTime c = LocalTime.of(22, 0);
        LocalTime o247 = LocalTime.MIDNIGHT;
        LocalTime c247 = LocalTime.of(23, 59);
        for (int d = 2; d <= 8; d++) {
            if (is247) {
                rows.add(RoomScheduleEntity.builder()
                        .property(property)
                        .dayOfWeek(d)
                        .isOpen(true)
                        .isOverDay(false)
                        .openTime(o247)
                        .closeTime(c247)
                        .build());
            } else {
                boolean open = d <= 7;
                rows.add(RoomScheduleEntity.builder()
                        .property(property)
                        .dayOfWeek(d)
                        .isOpen(open)
                        .isOverDay(false)
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
            boolean overDay = Boolean.TRUE.equals(it.getIsOverDay());
            if (open && !overDay) {
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
                .isOverDay(Boolean.TRUE.equals(e.getIsOverDay()))
                .openTime(e.getOpenTime())
                .closeTime(e.getCloseTime())
                .build();
    }
}
