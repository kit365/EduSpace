package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.business.service.RoomTimeslotService;
import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import com.eduspace.roomservice.common.util.SlugUtil;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.request.RoomSearchRequest;
import com.eduspace.roomservice.model.dto.response.PageResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.*;
import com.eduspace.roomservice.model.mapper.RoomMapper;
import com.eduspace.roomservice.model.mapper.RoomPolicyMapper;
import com.eduspace.roomservice.persistence.repository.AmenityRepository;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomCategoryRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.eduspace.roomservice.persistence.specification.RoomSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final RoomCategoryRepository categoryRepository;
    private final AmenityRepository amenityRepository;
    private final ObjectMapper objectMapper;
    private final RoomScheduleService roomScheduleService;
    private final RoomTimeslotService roomTimeslotService;
    private final RoomMapper roomMapper;
    private final RoomPolicyMapper roomPolicyMapper;

    @Override
    public PageResponse<RoomResponse> searchRooms(RoomSearchRequest request) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(request.getSortDir()), 
                request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        Specification<RoomEntity> spec = RoomSpecification.hasFilters(request);
        Page<RoomEntity> pageData = roomRepository.findAll(spec, pageable);

        return PageResponse.<RoomResponse>builder()
                .content(pageData.getContent().stream().map(this::mapToResponse).toList())
                .page(request.getPage())
                .size(request.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findByDeletedAtIsNull().stream().map(roomMapper::toResponse).toList();
    }

    @Override
    public List<String> getRoomCategories() {
        return java.util.Arrays.stream(RoomType.values())
                .map(Enum::name)
                .toList();
    }

    @Override
    public List<RoomResponse> getRoomsByPropertyId(Integer propertyId) {
        return roomRepository.findByProperty_IdAndDeletedAtIsNull(propertyId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<RoomResponse> getRoomsByCategorySlug(String categorySlug) {
         return roomRepository.findByCategory_SlugAndDeletedAtIsNull(categorySlug).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByOwnerId(String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            return List.of();
        }
        return roomRepository.findByProperty_OwnerIdAndDeletedAtIsNull(ownerId.trim()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Integer id) {
        return mapToResponse(roomRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND)));
    }

    @Override
    public RoomResponse getRoomBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        String key = slug.trim().toLowerCase();
        return mapToResponse(roomRepository.findBySlugAndDeletedAtIsNull(key)
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
        RoomEntity room = roomMapper.toEntity(request);
        room.setProperty(property);

        RoomCategoryEntity category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        room.setCategory(category);

        room.setSlug(SlugUtil.uniqueSlug(request.getNameVi() != null ? request.getNameVi() : "room", s -> roomRepository.existsBySlugAndDeletedAtIsNull(s)));

        // Handle Map Coordinates from Property
        room.setLatitude(property.getLatitude());
        room.setLongitude(property.getLongitude());

        // Initial workflow status
        room.setStatus(RoomStatus.READY.name());
        room.setApprovalStatus(RoomApprovalStatus.PENDING.name());
        room.setIsActive(true);

        // Map Policies
        if (request.getPolicies() != null) {
            List<RoomPolicyEntity> policies = request.getPolicies().stream()
                .map(pReq -> {
                    RoomPolicyEntity p = roomPolicyMapper.toEntity(pReq);
                    p.setRoom(room);
                    return p;
                })
                .toList();
            room.setPolicies(policies);
        }

        // Map Amenities
        if (request.getAmenityIds() != null) {
            List<RoomAmenityEntity> roomAmenities = request.getAmenityIds().stream()
                .map(amId -> {
                    AmenityEntity amenity = amenityRepository.findById(amId)
                        .orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
                    return RoomAmenityEntity.builder()
                        .room(room)
                        .amenity(amenity)
                        .quantity(1)
                        .build();
                })
                .collect(Collectors.toList());
            room.setAmenities(roomAmenities);
        }

        RoomEntity saved = roomRepository.save(room);
        roomScheduleService.seedDefaultsForNewRoom(saved.getId());
        roomTimeslotService.seedDefaultsForNewRoom(saved.getId());
        return roomMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        RoomEntity existing = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        roomMapper.updateEntity(request, existing);

        if (request.getCategorySlug() != null) {
             RoomCategoryEntity category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
             existing.setCategory(category);
        }

        // Update Policies if provided
        if (request.getPolicies() != null) {
            existing.getPolicies().clear();
            List<RoomPolicyEntity> newPolicies = request.getPolicies().stream()
                .map(pReq -> {
                    RoomPolicyEntity p = roomPolicyMapper.toEntity(pReq);
                    p.setRoom(existing);
                    return p;
                })
                .toList();
            existing.getPolicies().addAll(newPolicies);
        }

        // Update Amenities if provided
        if (request.getAmenityIds() != null) {
            existing.getAmenities().clear();
            List<RoomAmenityEntity> newAmenities = request.getAmenityIds().stream()
                .map(amId -> {
                    AmenityEntity amenity = amenityRepository.findById(amId)
                        .orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
                    return RoomAmenityEntity.builder()
                        .room(existing)
                        .amenity(amenity)
                        .quantity(1)
                        .build();
                })
                .collect(Collectors.toList());
            existing.getAmenities().addAll(newAmenities);
        }

        RoomEntity saved = roomRepository.save(existing);
        return roomMapper.toResponse(saved);
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
            return mapToResponse(roomRepository.save(room));
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
        return mapToResponse(roomRepository.save(room));
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
        return mapToResponse(roomRepository.save(room));
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

    private RoomResponse mapToResponse(RoomEntity e) {
        RoomResponse response = roomMapper.toResponse(e);
        response.setSchedules(roomScheduleService.listByRoomId(e.getId()));
        response.setTimeslots(roomTimeslotService.listByRoom(e.getId()));
        return response;
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
}
