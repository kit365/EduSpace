package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import com.eduspace.roomservice.common.util.SlugUtil;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final ObjectMapper objectMapper;
    private final RoomScheduleService roomScheduleService;

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
    }

    @Override
    public List<RoomResponse> getRoomsByPropertyId(Integer propertyId) {
        return roomRepository.findByProperty_IdAndDeletedAtIsNull(propertyId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<RoomResponse> getRoomsByOwnerId(String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            return List.of();
        }
        return roomRepository.findByProperty_OwnerIdAndDeletedAtIsNull(ownerId.trim()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Integer id) {
        return toResponse(roomRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND)));
    }

    @Override
    public RoomResponse getRoomBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        String key = slug.trim().toLowerCase();
        return toResponse(roomRepository.findBySlugAndDeletedAtIsNull(key)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND)));
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        if (request.getPropertyId() == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        RoomEntity entity = new RoomEntity();
        entity.setProperty(property);
        applyCreate(entity, request, property);
        entity.setSlug(SlugUtil.uniqueSlug(request.getName(), s -> roomRepository.existsBySlugAndDeletedAtIsNull(s)));
        if (entity.getAvgRating() == null) {
            entity.setAvgRating(BigDecimal.ZERO);
        }
        if (entity.getReviewCount() == null) {
            entity.setReviewCount(0);
        }
        RoomEntity saved = roomRepository.save(entity);
        roomScheduleService.seedDefaultsForNewRoom(saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        RoomEntity existing = roomRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        PropertyEntity propertyForLocation = existing.getProperty();
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            existing.setProperty(property);
            propertyForLocation = property;
        }
        applyUpdate(existing, request, propertyForLocation);
        return toResponse(roomRepository.save(existing));
    }

    @Override
    @Transactional
    public RoomResponse submitPendingEdit(Integer roomId, RoomRequest request, String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        PropertyEntity prop = room.getProperty();
        if (prop == null || !ownerId.trim().equals(prop.getOwnerId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        RoomApprovalStatus current = parseApproval(room.getApprovalStatus());
        if (current == RoomApprovalStatus.PENDING) {
            throw new AppException(ErrorCode.ROOM_EDIT_NOT_ALLOWED);
        }
        if (request.getPropertyId() != null) {
            PropertyEntity p2 = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            if (!ownerId.trim().equals(p2.getOwnerId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }
        RoomRequest toStore;
        try {
            toStore = objectMapper.convertValue(request, RoomRequest.class);
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        toStore.setApprovalStatus(null);
        toStore.setRejectionNote(null);
        if (toStore.getBookingType() == null) {
            toStore.setBookingType(BookingType.SLOT_BASED);
        }
        if (toStore.getStatus() == null) {
            toStore.setStatus(RoomStatus.ACTIVE);
        }
        try {
            String json = objectMapper.writeValueAsString(toStore);
            room.setPendingEditPayload(json);
            room.setPendingEditStatus("PENDING");
            room.setPendingEditRejectionNote(null);
            return toResponse(roomRepository.save(room));
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public RoomResponse approvePendingEdit(Integer roomId) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (!"PENDING".equals(room.getPendingEditStatus())) {
            throw new AppException(ErrorCode.ROOM_PENDING_EDIT_MISSING);
        }
        if (room.getPendingEditPayload() == null || room.getPendingEditPayload().isBlank()) {
            throw new AppException(ErrorCode.ROOM_PENDING_EDIT_MISSING);
        }
        try {
            RoomRequest req = objectMapper.readValue(room.getPendingEditPayload(), RoomRequest.class);
            room.setPendingEditPayload(null);
            room.setPendingEditStatus(null);
            room.setPendingEditRejectionNote(null);
            roomRepository.save(room);
            req.setApprovalStatus(RoomApprovalStatus.APPROVED);
            req.setRejectionNote(null);
            return update(roomId, req);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public RoomResponse rejectPendingEdit(Integer roomId, String rejectionNote) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (!"PENDING".equals(room.getPendingEditStatus())) {
            throw new AppException(ErrorCode.ROOM_PENDING_EDIT_MISSING);
        }
        room.setPendingEditPayload(null);
        room.setPendingEditStatus(null);
        room.setPendingEditRejectionNote(rejectionNote != null && !rejectionNote.isBlank() ? rejectionNote.trim() : null);
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateStatus(Integer id, RoomStatus status) {
        if (status == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        room.setStatus(status.name());
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        room.setDeletedAt(LocalDateTime.now());
        room.setIsActive(false);
        // Giải phóng UNIQUE(slug) — slug mới ngắn, duy nhất
        room.setSlug("deleted-" + id + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        roomRepository.save(room);
    }

    private static void applyCreate(RoomEntity e, RoomRequest r, PropertyEntity property) {
        e.setRoomType(enumName(r.getRoomType()));
        e.setBookingType(enumName(r.getBookingType()));
        e.setName(r.getName());
        e.setCapacity(r.getCapacity());
        e.setArea(r.getArea());
        e.setRoomNumber(r.getRoomNumber());
        e.setFloorNumber(r.getFloorNumber());
        e.setIs24_7(r.getIs24_7() != null ? r.getIs24_7() : Boolean.FALSE);
        e.setPricePerHour(r.getPricePerHour());
        e.setPricePerDay(r.getPricePerDay());
        e.setMinBookingHours(r.getMinBookingHours() != null ? r.getMinBookingHours() : 1);
        e.setImages(r.getImages());
        e.setDescription(r.getDescription());
        e.setStatus(enumName(r.getStatus()));
        e.setApprovalStatus(enumName(r.getApprovalStatus()));
        e.setRejectionNote(r.getRejectionNote());
        e.setDeletedAt(r.getDeletedAt());
        e.setIsActive(r.getIsActive() != null ? r.getIsActive() : Boolean.TRUE);
        e.setLocation(resolveLocation(r, property));
    }

    /** Client có thể gửi {@code location}; nếu không — ghép từ địa chỉ chi nhánh + phòng/tầng. */
    private static String resolveLocation(RoomRequest r, PropertyEntity property) {
        if (r.getLocation() != null && !r.getLocation().isBlank()) {
            return r.getLocation().trim();
        }
        return buildLocationFromProperty(property, r);
    }

    private static String buildLocationFromProperty(PropertyEntity p, RoomRequest r) {
        if (p == null) {
            return null;
        }
        String addr = p.getAddressDetail() != null ? p.getAddressDetail().trim() : "";
        StringBuilder sb = new StringBuilder(addr);
        if (r.getRoomNumber() != null && !r.getRoomNumber().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" · ");
            }
            sb.append("Phòng ").append(r.getRoomNumber().trim());
        }
        if (r.getFloorNumber() != null && !r.getFloorNumber().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" · ");
            }
            sb.append("Tầng ").append(r.getFloorNumber().trim());
        }
        return !sb.isEmpty() ? sb.toString() : null;
    }

    private static void applyUpdate(RoomEntity e, RoomRequest r, PropertyEntity propertyForLocation) {
        if (r.getRoomType() != null) {
            e.setRoomType(r.getRoomType().name());
        }
        if (r.getBookingType() != null) {
            e.setBookingType(r.getBookingType().name());
        }
        if (r.getName() != null) {
            e.setName(r.getName());
        }
        if (r.getCapacity() != null) {
            e.setCapacity(r.getCapacity());
        }
        if (r.getArea() != null) {
            e.setArea(r.getArea());
        }
        if (r.getRoomNumber() != null) {
            e.setRoomNumber(r.getRoomNumber());
        }
        if (r.getFloorNumber() != null) {
            e.setFloorNumber(r.getFloorNumber());
        }
        if (r.getIs24_7() != null) {
            e.setIs24_7(r.getIs24_7());
        }
        if (r.getPricePerHour() != null) {
            e.setPricePerHour(r.getPricePerHour());
        }
        if (r.getPricePerDay() != null) {
            e.setPricePerDay(r.getPricePerDay());
        }
        if (r.getMinBookingHours() != null) {
            e.setMinBookingHours(r.getMinBookingHours());
        }
        if (r.getImages() != null) {
            e.setImages(r.getImages());
        }
        if (r.getDescription() != null) {
            e.setDescription(r.getDescription());
        }
        if (r.getStatus() != null) {
            e.setStatus(r.getStatus().name());
        }
        if (r.getApprovalStatus() != null) {
            e.setApprovalStatus(r.getApprovalStatus().name());
        }
        if (r.getRejectionNote() != null) {
            e.setRejectionNote(r.getRejectionNote());
        }
        if (r.getDeletedAt() != null) {
            e.setDeletedAt(r.getDeletedAt());
        }
        if (r.getIsActive() != null) {
            e.setIsActive(r.getIsActive());
        }
        if (r.getLocation() != null) {
            e.setLocation(r.getLocation().isBlank() ? null : r.getLocation().trim());
        } else if (r.getRoomNumber() != null || r.getFloorNumber() != null || r.getPropertyId() != null) {
            RoomRequest tmp = new RoomRequest();
            tmp.setRoomNumber(r.getRoomNumber() != null ? r.getRoomNumber() : e.getRoomNumber());
            tmp.setFloorNumber(r.getFloorNumber() != null ? r.getFloorNumber() : e.getFloorNumber());
            e.setLocation(buildLocationFromProperty(propertyForLocation, tmp));
        }
    }

    private static String enumName(Enum<?> e) {
        return e == null ? null : e.name();
    }

    private static RoomType parseRoomType(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return RoomType.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static BookingType parseBookingType(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return BookingType.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static RoomStatus parseRoomStatus(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return RoomStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static RoomApprovalStatus parseApproval(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return RoomApprovalStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private RoomResponse toResponse(RoomEntity e) {
        Integer propertyId = e.getProperty() != null ? e.getProperty().getId() : null;
        List<RoomScheduleResponse> schedules = roomScheduleService.listByRoomId(e.getId());
        return RoomResponse.builder()
                .id(e.getId())
                .propertyId(propertyId)
                .roomType(parseRoomType(e.getRoomType()))
                .bookingType(parseBookingType(e.getBookingType()))
                .name(e.getName())
                .location(e.getLocation())
                .slug(e.getSlug())
                .capacity(e.getCapacity())
                .area(e.getArea())
                .roomNumber(e.getRoomNumber())
                .floorNumber(e.getFloorNumber())
                .is24_7(e.getIs24_7())
                .schedules(schedules)
                .pricePerHour(e.getPricePerHour())
                .pricePerDay(e.getPricePerDay())
                .minBookingHours(e.getMinBookingHours())
                .images(e.getImages())
                .description(e.getDescription())
                .status(parseRoomStatus(e.getStatus()))
                .approvalStatus(parseApproval(e.getApprovalStatus()))
                .rejectionNote(e.getRejectionNote())
                .avgRating(e.getAvgRating())
                .reviewCount(e.getReviewCount())
                .deletedAt(e.getDeletedAt())
                .isActive(e.getIsActive())
                .updatedAt(e.getUpdatedAt())
                .pendingEditStatus(e.getPendingEditStatus())
                .pendingEditRejectionNote(e.getPendingEditRejectionNote())
                .pendingEditPayload(e.getPendingEditPayload())
                .build();
    }
}
