package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.BookingService;
import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingAvailabilityResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import com.eduspace.bookingservice.model.dto.response.TimeSlotSummaryResponse;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.model.entity.BookingTimeSlotEntity;
import com.eduspace.bookingservice.model.entity.TimeSlotEntity;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.persistence.repository.BookingTimeSlotRepository;
import com.eduspace.bookingservice.persistence.repository.TimeSlotRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingTimeSlotRepository bookingTimeSlotRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final RoomValidationService roomValidationService;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        List<Long> requestedSlotIds = request.getSlotIds();
        if ((requestedSlotIds == null || requestedSlotIds.isEmpty()) && request.getSlotId() != null) {
            requestedSlotIds = List.of(request.getSlotId());
        }
        if (requestedSlotIds == null || requestedSlotIds.isEmpty()) {
            throw new IllegalArgumentException("At least one slot is required");
        }

        List<TimeSlotEntity> slots = timeSlotRepository.findByIdInAndIsActiveTrue(requestedSlotIds);
        if (slots.size() != new HashSet<>(requestedSlotIds).size()) {
            throw new IllegalArgumentException("Some selected slots do not exist or are inactive");
        }

        List<TimeSlotEntity> sortedSlots = sortByStart(slots);
        validateConsecutiveSlots(sortedSlots);
        roomValidationService.validateRoomBookable(request.getRoomId(), request.getBookingDate(), sortedSlots);

        List<Long> conflictSlotIds = bookingTimeSlotRepository.findBookedSlotIds(
                request.getRoomId(), request.getBookingDate(), requestedSlotIds);
        if (!conflictSlotIds.isEmpty()) {
            throw new IllegalArgumentException("One or more selected slots are already booked");
        }

        BookingEntity entity = new BookingEntity();
        entity.setBookingCode(generateBookingCode());
        entity.setRoomId(request.getRoomId());
        entity.setUserId(request.getUserId());
        entity.setCheckInDate(request.getBookingDate());
        entity.setCheckOutDate(request.getBookingDate());
        entity.setBookingDate(request.getBookingDate());
        entity.setStatus(BookingStatus.PENDING);
        BookingEntity saved = bookingRepository.save(entity);

        for (TimeSlotEntity slot : sortedSlots) {
            BookingTimeSlotEntity bookingSlot = new BookingTimeSlotEntity();
            bookingSlot.setBookingId(saved.getId());
            bookingSlot.setRoomId(saved.getRoomId());
            bookingSlot.setTimeSlotId(slot.getId());
            bookingSlot.setBookingDate(request.getBookingDate());
            bookingSlot.setStartTime(slot.getStartTime());
            bookingSlot.setEndTime(slot.getEndTime());
            bookingTimeSlotRepository.save(bookingSlot);
        }
        return toResponseFromEntities(saved, sortedSlots);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        BookingEntity entity = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        BookingEntity entity = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        entity.setStatus(BookingStatus.CANCELLED);
        BookingEntity saved = bookingRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public BookingAvailabilityResponse getAvailability(Long roomId, LocalDate bookingDate) {
        List<TimeSlotEntity> allSlots = timeSlotRepository.findByIsActiveTrueOrderByStartTimeAsc();
        Set<Long> bookedSlotIds = new HashSet<>(bookingTimeSlotRepository.findAllBookedSlotIds(roomId, bookingDate));
        List<TimeSlotSummaryResponse> slots = allSlots.stream()
                .map(slot -> TimeSlotSummaryResponse.builder()
                        .id(slot.getId())
                        .slotCode(slot.getSlotCode())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .available(!bookedSlotIds.contains(slot.getId()))
                        .build())
                .toList();

        return BookingAvailabilityResponse.builder()
                .roomId(roomId)
                .bookingDate(bookingDate)
                .slots(slots)
                .build();
    }

    private String generateBookingCode() {
        return "BK-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponse toResponse(BookingEntity entity) {
        List<BookingTimeSlotEntity> bookingSlots = bookingTimeSlotRepository.findByBookingIdOrderByStartTimeAsc(entity.getId());
        List<Long> slotIds = bookingSlots.stream().map(BookingTimeSlotEntity::getTimeSlotId).toList();
        List<TimeSlotEntity> slots = slotIds.isEmpty() ? List.of() : timeSlotRepository.findByIdInAndIsActiveTrue(slotIds);
        Map<Long, TimeSlotEntity> slotMap = slots.stream().collect(Collectors.toMap(TimeSlotEntity::getId, item -> item));
        List<TimeSlotSummaryResponse> summaries = bookingSlots.stream()
                .map(item -> {
                    TimeSlotEntity slot = slotMap.get(item.getTimeSlotId());
                    return TimeSlotSummaryResponse.builder()
                            .id(item.getTimeSlotId())
                            .slotCode(slot != null ? slot.getSlotCode() : null)
                            .startTime(item.getStartTime())
                            .endTime(item.getEndTime())
                            .available(false)
                            .build();
                })
                .toList();
        return toResponse(entity, summaries);
    }

    private BookingResponse toResponseFromEntities(BookingEntity entity, List<TimeSlotEntity> slots) {
        List<TimeSlotSummaryResponse> summaries = slots.stream()
                .map(slot -> TimeSlotSummaryResponse.builder()
                        .id(slot.getId())
                        .slotCode(slot.getSlotCode())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .available(false)
                        .build())
                .toList();
        return toResponse(entity, summaries);
    }

    private BookingResponse toResponse(BookingEntity entity, List<TimeSlotSummaryResponse> summaries) {
        return BookingResponse.builder()
                .id(entity.getId())
                .bookingCode(entity.getBookingCode())
                .roomId(entity.getRoomId())
                .userId(entity.getUserId())
                .bookingDate(entity.getBookingDate())
                .slots(summaries)
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private List<TimeSlotEntity> sortByStart(List<TimeSlotEntity> slots) {
        return slots.stream().sorted(Comparator.comparing(TimeSlotEntity::getStartTime)).toList();
    }

    private void validateConsecutiveSlots(List<TimeSlotEntity> slots) {
        for (int i = 1; i < slots.size(); i++) {
            if (!slots.get(i - 1).getEndTime().equals(slots.get(i).getStartTime())) {
                throw new IllegalArgumentException("Slots must be consecutive");
            }
        }
    }
}
