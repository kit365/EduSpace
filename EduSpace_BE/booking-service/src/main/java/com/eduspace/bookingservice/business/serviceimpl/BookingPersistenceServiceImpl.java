package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.BookingPersistenceService;
import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.model.dto.request.BookingExtraAmenityRequest;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.model.entity.ExtraBookingAmenityEntity;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.persistence.repository.ExtraBookingAmenityRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingPersistenceServiceImpl implements BookingPersistenceService {

    private final BookingRepository bookingRepository;
    private final ExtraBookingAmenityRepository extraBookingAmenityRepository;

    @Override
    @Transactional
    public PersistedBooking saveBookingAndExtras(CreateBookingRequest request) {
        LocalDate bookingDate = request.getBookingDate();

        BookingEntity entity = new BookingEntity();
        entity.setBookingCode(generateBookingCode());
        entity.setRoomId(request.getRoomId());
        entity.setUserId(request.getUserId());
        entity.setGuestEmail(request.getGuestEmail().trim());

        entity.setBookingDate(bookingDate);
        entity.setCheckInDate(request.getStartDateTime().toLocalDate());
        entity.setCheckOutDate(request.getEndDateTime().toLocalDate());
        entity.setStartDateTime(request.getStartDateTime());
        entity.setEndDateTime(request.getEndDateTime());

        entity.setDurationValue(request.getDurationValue());
        entity.setDurationUnit(request.getDurationUnit());

        entity.setStatus(BookingStatus.PENDING);

        BookingEntity saved = bookingRepository.save(entity);

        List<ExtraBookingAmenityEntity> savedExtras = List.of();
        if (request.getExtraAmenities() != null && !request.getExtraAmenities().isEmpty()) {
            validateExtraAmenityRequests(request.getExtraAmenities());
            savedExtras = extraBookingAmenityRepository.saveAll(
                    buildExtraAmenityEntities(saved.getId(), request.getExtraAmenities()));
        }

        return new PersistedBooking(saved, savedExtras);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteBookingAndExtras(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }

    private void validateExtraAmenityRequests(List<BookingExtraAmenityRequest> lines) {
        Set<Long> seen = new HashSet<>();
        for (BookingExtraAmenityRequest line : lines) {
            if (line.getAmenityId() == null) {
                throw new IllegalArgumentException("extraAmenities.amenityId is required");
            }
            if (line.getQuantity() == null || line.getQuantity() < 1) {
                throw new IllegalArgumentException("extraAmenities.quantity must be >= 1");
            }
            if (!seen.add(line.getAmenityId())) {
                throw new IllegalArgumentException("Duplicate amenityId in extraAmenities");
            }
        }
    }

    private List<ExtraBookingAmenityEntity> buildExtraAmenityEntities(
            Long bookingId, List<BookingExtraAmenityRequest> lines) {
        List<ExtraBookingAmenityEntity> out = new ArrayList<>(lines.size());
        for (BookingExtraAmenityRequest line : lines) {
            ExtraBookingAmenityEntity e = new ExtraBookingAmenityEntity();
            e.setBookingId(bookingId);
            e.setAmenityId(line.getAmenityId());
            e.setQuantity(line.getQuantity());
            out.add(e);
        }
        return out;
    }

    private String generateBookingCode() {
        return "BK-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
