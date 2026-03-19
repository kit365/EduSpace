package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import com.eduspace.roomservice.common.util.SlugUtil;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;

import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<RoomResponse> getRoomsByPropertyId(Integer propertyId) {
        return roomRepository.findByProperty_Id(propertyId).stream().map(this::toResponse).toList();
    }

    @Override
    public RoomResponse getRoomById(Integer id) {
        return toResponse(roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND)));
    }

    @Override
    public RoomResponse getRoomBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        String key = slug.trim().toLowerCase();
        return toResponse(roomRepository.findBySlug(key)
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
        applyCreate(entity, request);
        entity.setSlug(SlugUtil.uniqueSlug(request.getName(), s -> roomRepository.findBySlug(s).isPresent()));
        if (entity.getAvgRating() == null) {
            entity.setAvgRating(BigDecimal.ZERO);
        }
        if (entity.getReviewCount() == null) {
            entity.setReviewCount(0);
        }
        return toResponse(roomRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        RoomEntity existing = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        applyUpdate(existing, request);
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            existing.setProperty(property);
        }
        return toResponse(roomRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        roomRepository.deleteById(id);
    }

    private static void applyCreate(RoomEntity e, RoomRequest r) {
        e.setRoomType(enumName(r.getRoomType()));
        e.setBookingType(enumName(r.getBookingType()));
        e.setName(r.getName());
        e.setCapacity(r.getCapacity());
        e.setArea(r.getArea());
        e.setLocation(r.getLocation());
        e.setImages(r.getImages());
        e.setDescription(r.getDescription());
        e.setStatus(enumName(r.getStatus()));
        e.setApprovalStatus(enumName(r.getApprovalStatus()));
        e.setRejectionNote(r.getRejectionNote());
        e.setDeletedAt(r.getDeletedAt());
        e.setIsActive(r.getIsActive() != null ? r.getIsActive() : Boolean.TRUE);
    }

    private static void applyUpdate(RoomEntity e, RoomRequest r) {
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
        if (r.getLocation() != null) {
            e.setLocation(r.getLocation());
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
        return RoomResponse.builder()
                .id(e.getId())
                .propertyId(propertyId)
                .roomType(parseRoomType(e.getRoomType()))
                .bookingType(parseBookingType(e.getBookingType()))
                .name(e.getName())
                .slug(e.getSlug())
                .capacity(e.getCapacity())
                .area(e.getArea())
                .location(e.getLocation())
                .images(e.getImages())
                .description(e.getDescription())
                .status(parseRoomStatus(e.getStatus()))
                .approvalStatus(parseApproval(e.getApprovalStatus()))
                .rejectionNote(e.getRejectionNote())
                .avgRating(e.getAvgRating())
                .reviewCount(e.getReviewCount())
                .deletedAt(e.getDeletedAt())
                .isActive(e.getIsActive())
                .build();
    }
}
