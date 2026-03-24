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
import com.eduspace.roomservice.model.dto.request.RoomPriceQuoteRequest;
import com.eduspace.roomservice.model.dto.request.RoomPriceRuleRequest;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.request.RoomSearchRequest;
import com.eduspace.roomservice.model.dto.response.PageResponse;
import com.eduspace.roomservice.model.dto.response.RoomPriceQuoteResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import com.eduspace.roomservice.model.entity.*;
import com.eduspace.roomservice.model.mapper.RoomMapper;
import com.eduspace.roomservice.model.mapper.RoomPolicyMapper;
import com.eduspace.roomservice.persistence.repository.AmenityRepository;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomCategoryRepository;
import com.eduspace.roomservice.persistence.repository.RoomPriceRuleRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.eduspace.roomservice.persistence.specification.RoomSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private final RoomPriceRuleRepository roomPriceRuleRepository;
    private final ObjectMapper objectMapper;
    private final RoomScheduleService roomScheduleService;
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
        normalizeDurationConfig(request);
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

        upsertPriceRules(room, request.getPriceRules());
        RoomEntity saved = roomRepository.save(room);
        roomScheduleService.seedDefaultsForNewRoom(saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        normalizeDurationConfig(request);
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

        if (request.getPriceRules() != null) {
            upsertPriceRules(existing, request.getPriceRules());
        }
        RoomEntity saved = roomRepository.save(existing);
        return mapToResponse(saved);
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
    @Transactional(readOnly = true)
    public RoomPriceQuoteResponse quotePrice(Integer roomId, RoomPriceQuoteRequest request) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        int durationMinutes = extractDurationMinutes(request);
        int minDuration = room.getMinDuration() != null ? room.getMinDuration() : 60;
        int stepUnit = room.getStepUnit() != null ? room.getStepUnit() : 30;
        if (durationMinutes < minDuration || durationMinutes % stepUnit != 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        BigDecimal durationHours = BigDecimal.valueOf(durationMinutes)
                .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);

        Integer bookingDayOfWeekDb = parseBookingDayOfWeekDb(request);
        List<RoomPriceRuleEntity> rules = roomPriceRuleRepository.findByRoom_IdOrderByIdAsc(roomId).stream()
                .filter(r -> ruleAppliesOnWeekday(r, bookingDayOfWeekDb))
                .toList();
        RoomPriceRuleEntity matchedRule = rules.stream()
                .filter(r -> ruleMatches(r, durationHours))
                .findFirst()
                .orElse(null);

        BigDecimal unitPrice;
        BigDecimal subtotal;
        String mode;
        Integer matchedRuleId = matchedRule != null ? matchedRule.getId() : null;

        if (matchedRule != null && matchedRule.getFlatPrice() != null) {
            mode = "RULE_FLAT_PRICE";
            unitPrice = null;
            subtotal = matchedRule.getFlatPrice();
        } else if (matchedRule != null && matchedRule.getPricePerHour() != null) {
            mode = "RULE_PRICE_PER_HOUR";
            unitPrice = matchedRule.getPricePerHour();
            subtotal = durationHours.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
        } else {
            mode = "ROOM_DEFAULT_PER_UNIT";
            BigDecimal pricePerHour = room.getPricePerHour() != null ? room.getPricePerHour() : BigDecimal.ZERO;
            unitPrice = pricePerHour
                    .multiply(BigDecimal.valueOf(stepUnit))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal units = BigDecimal.valueOf(durationMinutes)
                    .divide(BigDecimal.valueOf(stepUnit), 0, RoundingMode.UNNECESSARY);
            subtotal = unitPrice.multiply(units).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal weekendSurchargePercent = room.getWeekendSurchargePercent() != null
                ? room.getWeekendSurchargePercent()
                : BigDecimal.ZERO;
        boolean weekendSurchargeApplied = isWeekendSurchargeApplied(room, request);
        BigDecimal weekendSurchargeAmount = weekendSurchargeApplied
                ? subtotal.multiply(weekendSurchargePercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(weekendSurchargeAmount).setScale(2, RoundingMode.HALF_UP);

        return RoomPriceQuoteResponse.builder()
                .roomId(roomId)
                .durationMinutes(durationMinutes)
                .durationHours(durationHours)
                .minDuration(minDuration)
                .stepUnit(stepUnit)
                .matchedRuleId(matchedRuleId)
                .pricingMode(mode)
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .weekendSurchargeApplied(weekendSurchargeApplied)
                .weekendSurchargePercent(weekendSurchargePercent)
                .weekendSurchargeAmount(weekendSurchargeAmount)
                .total(total)
                .build();
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
        if (response.getMainImageUrl() == null || response.getMainImageUrl().isBlank()) {
            String images = response.getImages();
            if (images != null && !images.isBlank()) {
                String first = images.split(",")[0].trim();
                if (!first.isBlank()) {
                    response.setMainImageUrl(first);
                }
            }
        }
        response.setMinBookingHours(toLegacyMinBookingHours(response.getMinDuration()));
        response.setPriceRules(roomPriceRuleRepository.findByRoom_IdOrderByIdAsc(e.getId()).stream()
                .map(r -> com.eduspace.roomservice.model.dto.response.RoomPriceRuleResponse.builder()
                        .id(r.getId())
                        .minHours(r.getMinHours())
                        .maxHours(r.getMaxHours())
                        .pricePerHour(r.getPricePerHour())
                        .flatPrice(r.getFlatPrice())
                        .label(r.getLabel())
                        .applicableDayOfWeeks(sortedApplicableDays(r))
                        .build())
                .toList());
        if (e.getProperty() != null) {
            var p = e.getProperty();
            response.setScheduleBufferMinutes(p.getScheduleBufferMinutes() != null ? p.getScheduleBufferMinutes() : 0);
            response.setScheduleIsOverDay(p.getScheduleIsOverDay());
            response.setSchedules(roomScheduleService.listByPropertyId(p.getId()));
        } else {
            response.setSchedules(List.of());
        }
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

    private static int extractDurationMinutes(RoomPriceQuoteRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getDurationMinutes() != null && request.getDurationMinutes() > 0) {
            return request.getDurationMinutes();
        }
        if (request.getStartDateTime() != null && request.getEndDateTime() != null) {
            try {
                LocalDateTime start = LocalDateTime.parse(request.getStartDateTime().trim());
                LocalDateTime end = LocalDateTime.parse(request.getEndDateTime().trim());
                long minutes = Duration.between(start, end).toMinutes();
                if (minutes <= 0) {
                    throw new AppException(ErrorCode.INVALID_KEY);
                }
                return Math.toIntExact(minutes);
            } catch (RuntimeException ex) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
        }
        throw new AppException(ErrorCode.INVALID_KEY);
    }

    private static List<Integer> sortedApplicableDays(RoomPriceRuleEntity r) {
        if (r.getApplicableDayOfWeeks() == null || r.getApplicableDayOfWeeks().isEmpty()) {
            return List.of();
        }
        return r.getApplicableDayOfWeeks().stream().sorted().toList();
    }

    private static Integer parseBookingDayOfWeekDb(RoomPriceQuoteRequest request) {
        if (request == null || request.getStartDateTime() == null || request.getStartDateTime().isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(request.getStartDateTime().trim()).getDayOfWeek().getValue() + 1;
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private static boolean ruleAppliesOnWeekday(RoomPriceRuleEntity rule, Integer bookingDayOfWeekDb) {
        if (rule.getApplicableDayOfWeeks() == null || rule.getApplicableDayOfWeeks().isEmpty()) {
            return true;
        }
        if (bookingDayOfWeekDb == null) {
            return true;
        }
        return rule.getApplicableDayOfWeeks().contains(bookingDayOfWeekDb);
    }

    private static BigDecimal operatingHours(RoomScheduleResponse s) {
        if (s == null || !Boolean.TRUE.equals(s.getIsOpen())) {
            return BigDecimal.ZERO;
        }
        if (Boolean.TRUE.equals(s.getIsOverDay())) {
            return BigDecimal.valueOf(24);
        }
        LocalTime o = s.getOpenTime();
        LocalTime c = s.getCloseTime();
        if (o == null || c == null) {
            return BigDecimal.ZERO;
        }
        long minutes = Duration.between(o, c).toMinutes();
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
    }

    private void applyApplicableDays(
            RoomPriceRuleRequest req, List<RoomScheduleResponse> schedules, RoomPriceRuleEntity entity) {
        List<Integer> raw = req.getApplicableDayOfWeeks();
        if (raw == null || raw.isEmpty()) {
            entity.setApplicableDayOfWeeks(new HashSet<>());
            return;
        }
        Set<Integer> normalized = new HashSet<>();
        for (Integer d : raw) {
            if (d == null || d < 2 || d > 8) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            normalized.add(d);
        }
        BigDecimal minH = BigDecimal.valueOf(req.getMinHours());
        if (!schedules.isEmpty()) {
            for (Integer dow : normalized) {
                RoomScheduleResponse row = schedules.stream()
                        .filter(s -> dow.equals(s.getDayOfWeek()))
                        .findFirst()
                        .orElse(null);
                BigDecimal opH = operatingHours(row);
                if (minH.compareTo(opH) > 0) {
                    throw new AppException(ErrorCode.INVALID_KEY);
                }
            }
        }
        entity.setApplicableDayOfWeeks(normalized);
    }

    private static boolean ruleMatches(RoomPriceRuleEntity rule, BigDecimal durationHours) {
        if (rule == null || rule.getMinHours() == null) {
            return false;
        }
        BigDecimal min = BigDecimal.valueOf(rule.getMinHours());
        if (durationHours.compareTo(min) < 0) {
            return false;
        }
        if (rule.getMaxHours() == null) {
            return true;
        }
        BigDecimal max = BigDecimal.valueOf(rule.getMaxHours());
        return durationHours.compareTo(max) <= 0;
    }

    private static int toLegacyMinBookingHours(Integer minDuration) {
        if (minDuration == null || minDuration <= 0) {
            return 1;
        }
        return (int) Math.ceil(minDuration / 60.0d);
    }

    private static void normalizeDurationConfig(RoomRequest request) {
        if (request == null) {
            return;
        }
        Integer minDuration = request.getMinDuration();
        if (minDuration == null || minDuration <= 0) {
            if (request.getMinBookingHours() != null && request.getMinBookingHours() > 0) {
                minDuration = request.getMinBookingHours() * 60;
            } else {
                minDuration = 60;
            }
        }
        Integer stepUnit = request.getStepUnit();
        if (stepUnit == null || stepUnit <= 0) {
            stepUnit = 30;
        }
        if (minDuration % stepUnit != 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Boolean weekendEnabled = request.getWeekendSurchargeEnabled();
        if (weekendEnabled == null) {
            weekendEnabled = false;
        }
        BigDecimal weekendPercent = request.getWeekendSurchargePercent();
        if (weekendPercent == null || weekendPercent.compareTo(BigDecimal.ZERO) < 0) {
            weekendPercent = BigDecimal.ZERO;
        }
        Boolean applySat = request.getWeekendApplySaturday();
        Boolean applySun = request.getWeekendApplySunday();
        if (applySat == null) applySat = false;
        if (applySun == null) applySun = true;
        request.setMinDuration(minDuration);
        request.setStepUnit(stepUnit);
        request.setMinBookingHours(toLegacyMinBookingHours(minDuration));
        request.setWeekendSurchargeEnabled(weekendEnabled);
        request.setWeekendSurchargePercent(weekendPercent);
        request.setWeekendApplySaturday(applySat);
        request.setWeekendApplySunday(applySun);
    }

    private void upsertPriceRules(RoomEntity room, List<RoomPriceRuleRequest> requests) {
        room.getPriceRules().clear();
        if (requests == null || requests.isEmpty()) {
            return;
        }
        Integer propertyId = room.getProperty() != null ? room.getProperty().getId() : null;
        List<RoomScheduleResponse> schedules =
                propertyId != null ? roomScheduleService.listByPropertyId(propertyId) : List.of();
        List<RoomPriceRuleEntity> entities = requests.stream()
                .map(req -> {
                    if (req == null || req.getMinHours() == null || req.getMinHours() <= 0) {
                        throw new AppException(ErrorCode.INVALID_KEY);
                    }
                    if (req.getMaxHours() != null && req.getMaxHours() < req.getMinHours()) {
                        throw new AppException(ErrorCode.INVALID_KEY);
                    }
                    if (req.getFlatPrice() == null && req.getPricePerHour() == null) {
                        throw new AppException(ErrorCode.INVALID_KEY);
                    }
                    RoomPriceRuleEntity built = RoomPriceRuleEntity.builder()
                            .room(room)
                            .minHours(req.getMinHours())
                            .maxHours(req.getMaxHours())
                            .pricePerHour(req.getPricePerHour())
                            .flatPrice(req.getFlatPrice())
                            .label(req.getLabel())
                            .build();
                    applyApplicableDays(req, schedules, built);
                    return built;
                })
                .collect(Collectors.toList());
        room.getPriceRules().addAll(entities);
    }

    private static boolean isWeekendSurchargeApplied(RoomEntity room, RoomPriceQuoteRequest request) {
        if (room.getWeekendSurchargeEnabled() == null || !room.getWeekendSurchargeEnabled()) {
            return false;
        }
        if (room.getWeekendSurchargePercent() == null || room.getWeekendSurchargePercent().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        if (request == null || request.getStartDateTime() == null || request.getStartDateTime().isBlank()) {
            return false;
        }
        try {
            DayOfWeek dow = LocalDateTime.parse(request.getStartDateTime().trim()).getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY) {
                return Boolean.TRUE.equals(room.getWeekendApplySaturday());
            }
            if (dow == DayOfWeek.SUNDAY) {
                return Boolean.TRUE.equals(room.getWeekendApplySunday());
            }
            return false;
        } catch (RuntimeException ex) {
            return false;
        }
    }
}
