package com.eduspace.bookingservice.business.serviceimpl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eduspace.bookingservice.business.service.BookingPersistenceService;
import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.business.service.SagaService;
import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.common.enums.DurationUnit;
import com.eduspace.bookingservice.infrastructure.client.AccountNotificationClient;
import com.eduspace.bookingservice.model.dto.integration.AccountApiResponse;
import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.persistence.repository.ExtraBookingAmenityRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ExtraBookingAmenityRepository extraBookingAmenityRepository;

    @Mock
    private RoomValidationService roomValidationService;

    @Mock
    private BookingPersistenceService bookingPersistenceService;

    @Mock
    private AccountNotificationClient accountNotificationClient;

    @Mock
    private SagaService sagaService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private CreateBookingRequest request;

    @BeforeEach
    void setUp() {
        request = new CreateBookingRequest();
        request.setRoomId(101L);
        request.setUserId("user-1");
        request.setGuestEmail("guest@example.com");
        request.setBookingDate(LocalDate.now().plusDays(1));
        request.setStartDateTime(request.getBookingDate().atTime(8, 0));
        request.setEndDateTime(request.getBookingDate().atTime(10, 0));
        request.setDurationValue(120);
        request.setDurationUnit(DurationUnit.MINUTE);
    }

    @Test
    void createBooking_success_whenRangeAvailable() {
        RoomResponsePayload room = new RoomResponsePayload();
        room.setId(101);
        room.setName("Phòng A");

        when(roomValidationService.validateRoomBookableAndGetRoom(
                        request.getRoomId(),
                        request.getBookingDate(),
                        request.getStartDateTime(),
                        request.getEndDateTime()))
                .thenReturn(room);

        when(bookingRepository.existsOverlap(
                        request.getRoomId(),
                        request.getBookingDate(),
                        request.getStartDateTime(),
                        request.getEndDateTime(),
                        BookingStatus.CANCELLED))
                .thenReturn(false);

        BookingEntity saved = new BookingEntity();
        saved.setId(10L);
        saved.setBookingCode("BK-2026-ABCDEF12");
        saved.setRoomId(request.getRoomId());
        saved.setUserId(request.getUserId());
        saved.setGuestEmail(request.getGuestEmail());
        saved.setBookingDate(request.getBookingDate());
        saved.setCheckInDate(request.getStartDateTime().toLocalDate());
        saved.setCheckOutDate(request.getEndDateTime().toLocalDate());
        saved.setStartDateTime(request.getStartDateTime());
        saved.setEndDateTime(request.getEndDateTime());
        saved.setDurationValue(request.getDurationValue());
        saved.setDurationUnit(request.getDurationUnit());
        saved.setStatus(BookingStatus.PENDING);

        when(bookingPersistenceService.saveBookingAndExtras(request))
                .thenReturn(new BookingPersistenceService.PersistedBooking(saved, List.of()));

        AccountApiResponse mailOk = new AccountApiResponse();
        mailOk.setSuccess(true);
        when(accountNotificationClient.sendBookingConfirmation(any())).thenReturn(mailOk);

        BookingResponse response = bookingService.createBooking(request);

        verify(extraBookingAmenityRepository, never()).saveAll(any());
        verify(sagaService).completeSaga(any());

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(request.getGuestEmail(), response.getGuestEmail());
        assertEquals(request.getStartDateTime(), response.getStartDateTime());
        assertEquals(request.getEndDateTime(), response.getEndDateTime());
        verify(roomValidationService)
                .validateRoomBookableAndGetRoom(
                        request.getRoomId(),
                        request.getBookingDate(),
                        request.getStartDateTime(),
                        request.getEndDateTime());
    }

    @Test
    void createBooking_throw_whenOverlapExists() {
        RoomResponsePayload room = new RoomResponsePayload();
        room.setId(101);
        when(roomValidationService.validateRoomBookableAndGetRoom(
                        request.getRoomId(),
                        request.getBookingDate(),
                        request.getStartDateTime(),
                        request.getEndDateTime()))
                .thenReturn(room);
        when(bookingRepository.existsOverlap(
                        request.getRoomId(),
                        request.getBookingDate(),
                        request.getStartDateTime(),
                        request.getEndDateTime(),
                        BookingStatus.CANCELLED))
                .thenReturn(true);

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(request));

        assertTrue(ex.getMessage().contains("already booked"));
    }

    @Test
    void createBooking_throw_whenEndBeforeStart() {
        request.setStartDateTime(request.getBookingDate().atTime(10, 0));
        request.setEndDateTime(request.getBookingDate().atTime(8, 0));

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(request));

        assertTrue(ex.getMessage().contains("Invalid time range"));
    }

    @Test
    void cancelBooking_success() {
        BookingEntity existing = new BookingEntity();
        existing.setId(9L);
        existing.setRoomId(101L);
        existing.setUserId("user-1");
        existing.setGuestEmail("g@e.com");
        existing.setBookingDate(LocalDate.now().plusDays(1));
        existing.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(extraBookingAmenityRepository.findByBookingId(9L)).thenReturn(Collections.emptyList());

        BookingResponse response = bookingService.cancelBooking(9L);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void getAllBookings_success() {
        BookingEntity b1 = new BookingEntity();
        b1.setId(1L);
        b1.setBookingCode("BK-1");
        b1.setRoomId(101L);
        b1.setUserId("u1");
        b1.setGuestEmail("a@b.com");
        b1.setBookingDate(LocalDate.now().plusDays(1));
        b1.setStatus(BookingStatus.PENDING);

        BookingEntity b2 = new BookingEntity();
        b2.setId(2L);
        b2.setBookingCode("BK-2");
        b2.setRoomId(102L);
        b2.setUserId("u2");
        b2.setGuestEmail("c@d.com");
        b2.setBookingDate(LocalDate.now().plusDays(2));
        b2.setStatus(BookingStatus.CANCELLED);

        when(bookingRepository.findAll()).thenReturn(List.of(b1, b2));
        when(extraBookingAmenityRepository.findByBookingIdIn(any())).thenReturn(Collections.emptyList());

        List<BookingResponse> responses = bookingService.getAllBookings();
        assertEquals(2, responses.size());
    }
}
