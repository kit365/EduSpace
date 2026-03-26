package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.BookingPersistenceService;
import com.eduspace.bookingservice.business.service.BookingService;
import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.business.service.SagaService;
import com.eduspace.bookingservice.common.constants.BookingSagaConstants;
import com.eduspace.bookingservice.infrastructure.client.AccountNotificationClient;
import com.eduspace.bookingservice.model.dto.integration.AccountApiResponse;
import com.eduspace.bookingservice.model.dto.integration.BookingConfirmationPayload;
import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingByCodeResponse;
import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.model.dto.response.BookingExtraAmenityResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.model.entity.ExtraBookingAmenityEntity;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.persistence.repository.ExtraBookingAmenityRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ExtraBookingAmenityRepository extraBookingAmenityRepository;
    private final RoomValidationService roomValidationService;
    private final BookingPersistenceService bookingPersistenceService;
    private final AccountNotificationClient accountNotificationClient;
    private final SagaService sagaService;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        if (request.getStartDateTime() == null || request.getEndDateTime() == null) {
            throw new IllegalArgumentException("Missing start/end time");
        }
        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException("Invalid time range");
        }
        if (request.getBookingDate() == null) {
            throw new IllegalArgumentException("Missing booking date");
        }
        if (request.getGuestEmail() == null || request.getGuestEmail().isBlank()) {
            throw new IllegalArgumentException("guestEmail is required");
        }

        LocalDate bookingDate = request.getBookingDate();

        String sagaId = UUID.randomUUID().toString();
        Map<String, Object> sagaPayload =
                new HashMap<>(Map.of("roomId", request.getRoomId(), "guestEmail", request.getGuestEmail()));
        sagaService.startSaga(
                sagaId,
                BookingSagaConstants.TYPE_CREATE_BOOKING,
                BookingSagaConstants.STEP_VALIDATE_ROOM,
                sagaPayload);

        RoomResponsePayload room;
        try {
            room = roomValidationService.validateRoomBookableAndGetRoom(
                    request.getRoomId(), bookingDate, request.getStartDateTime(), request.getEndDateTime());
        } catch (RuntimeException e) {
            sagaService.failSaga(sagaId, e.getMessage());
            throw e;
        }

        boolean existsOverlap = bookingRepository.existsOverlap(
                request.getRoomId(),
                bookingDate,
                request.getStartDateTime(),
                request.getEndDateTime(),
                BookingStatus.CANCELLED);
        if (existsOverlap) {
            sagaService.failSaga(sagaId, "Room is already booked for the selected time range");
            throw new IllegalArgumentException("Room is already booked for the selected time range");
        }

        BookingPersistenceService.PersistedBooking persisted;
        try {
            persisted = bookingPersistenceService.saveBookingAndExtras(request);
        } catch (RuntimeException e) {
            sagaService.failSaga(sagaId, e.getMessage());
            throw e;
        }

        try {
            BookingConfirmationPayload emailPayload = BookingConfirmationPayload.builder()
                    .toEmail(request.getGuestEmail().trim())
                    .recipientName(guestDisplayName(request.getGuestEmail()))
                    .bookingCode(persisted.booking().getBookingCode())
                    .roomTitle(room.getName() != null && !room.getName().isBlank()
                            ? room.getName()
                            : "Phòng #" + room.getId())
                    .bookingDate(request.getBookingDate())
                    .startDateTime(request.getStartDateTime())
                    .endDateTime(request.getEndDateTime())
                    .build();

            AccountApiResponse resp = accountNotificationClient.sendBookingConfirmation(emailPayload);
            if (resp == null || !resp.isSuccess()) {
                throw new IllegalStateException("Account service rejected booking confirmation email");
            }
        } catch (Exception e) {
            log.warn("Booking confirmation email failed for saga {}: {}", sagaId, e.getMessage());
            try {
                bookingPersistenceService.deleteBookingAndExtras(persisted.booking().getId());
            } catch (Exception compensateEx) {
                log.error(
                        "Compensation failed after email error for booking {}: {}",
                        persisted.booking().getId(),
                        compensateEx.getMessage());
            }
            sagaService.failSaga(sagaId, "EMAIL_FAILED: " + e.getMessage());
            throw new IllegalStateException("Booking confirmation email failed; booking was cancelled.", e);
        }

        sagaService.completeSaga(sagaId);
        return toResponse(persisted.booking(), persisted.extras());
    }

    private static String guestDisplayName(String email) {
        if (email == null) {
            return "Khách";
        }
        int at = email.indexOf('@');
        String local = at > 0 ? email.substring(0, at) : email;
        return local.isBlank() ? "Khách" : local;
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        List<BookingEntity> bookings = bookingRepository.findAll();
        if (bookings.isEmpty()) {
            return List.of();
        }
        List<Long> ids = bookings.stream().map(BookingEntity::getId).toList();
        List<ExtraBookingAmenityEntity> allExtras = extraBookingAmenityRepository.findByBookingIdIn(ids);
        Map<Long, List<ExtraBookingAmenityEntity>> byBooking = new HashMap<>();
        for (ExtraBookingAmenityEntity row : allExtras) {
            byBooking.computeIfAbsent(row.getBookingId(), k -> new ArrayList<>()).add(row);
        }
        return bookings.stream()
                .map(b -> toResponse(b, byBooking.getOrDefault(b.getId(), List.of())))
                .toList();
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        BookingEntity entity = bookingRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        return toResponse(entity, extraBookingAmenityRepository.findByBookingId(id));
    }

    @Override
    public BookingByCodeResponse getByBookingCode(String bookingCode) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new IllegalArgumentException("bookingCode is required");
        }
        return bookingRepository
                .findByBookingCode(bookingCode.trim())
                .map(e -> new BookingByCodeResponse(
                        e.getId(), e.getBookingCode(), e.getUserId(), e.getGuestEmail()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        BookingEntity entity = bookingRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        entity.setStatus(BookingStatus.CANCELLED);
        BookingEntity saved = bookingRepository.save(entity);
        return toResponse(saved, extraBookingAmenityRepository.findByBookingId(entity.getId()));
    }

    private BookingResponse toResponse(BookingEntity entity, List<ExtraBookingAmenityEntity> extras) {
        List<BookingExtraAmenityResponse> extraLines = extras.stream()
                .map(e -> BookingExtraAmenityResponse.builder()
                        .id(e.getId())
                        .amenityId(e.getAmenityId())
                        .quantity(e.getQuantity())
                        .build())
                .toList();
        return BookingResponse.builder()
                .id(entity.getId())
                .bookingCode(entity.getBookingCode())
                .roomId(entity.getRoomId())
                .userId(entity.getUserId())
                .guestEmail(entity.getGuestEmail())
                .checkInDate(entity.getCheckInDate())
                .checkOutDate(entity.getCheckOutDate())
                .bookingDate(entity.getBookingDate())
                .durationValue(entity.getDurationValue())
                .durationUnit(entity.getDurationUnit())
                .startDateTime(entity.getStartDateTime())
                .endDateTime(entity.getEndDateTime())
                .totalPrice(entity.getTotalPrice())
                .voucherCode(entity.getVoucherCode())
                .discountAmount(entity.getDiscountAmount())
                .finalPrice(entity.getFinalPrice())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .extraAmenities(extraLines)
                .build();
    }
}
