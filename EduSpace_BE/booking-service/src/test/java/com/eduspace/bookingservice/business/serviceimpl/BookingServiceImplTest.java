package com.eduspace.bookingservice.business.serviceimpl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eduspace.bookingservice.business.service.RoomValidationService;
import com.eduspace.bookingservice.common.enums.BookingStatus;
import com.eduspace.bookingservice.model.dto.request.CreateBookingRequest;
import com.eduspace.bookingservice.model.dto.response.BookingAvailabilityResponse;
import com.eduspace.bookingservice.model.dto.response.BookingResponse;
import com.eduspace.bookingservice.model.entity.BookingEntity;
import com.eduspace.bookingservice.model.entity.BookingTimeSlotEntity;
import com.eduspace.bookingservice.model.entity.TimeSlotEntity;
import com.eduspace.bookingservice.persistence.repository.BookingRepository;
import com.eduspace.bookingservice.persistence.repository.BookingTimeSlotRepository;
import com.eduspace.bookingservice.persistence.repository.TimeSlotRepository;
import java.time.LocalDate;
import java.time.LocalTime;
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
    private BookingTimeSlotRepository bookingTimeSlotRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private RoomValidationService roomValidationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private CreateBookingRequest request;
    private TimeSlotEntity slot1;
    private TimeSlotEntity slot2;

    @BeforeEach
    void setUp() {
        request = new CreateBookingRequest();
        request.setRoomId(101L);
        request.setUserId("user-1");
        request.setBookingDate(LocalDate.now().plusDays(1));
        request.setSlotIds(List.of(1L, 2L));

        slot1 = new TimeSlotEntity();
        slot1.setId(1L);
        slot1.setSlotCode("SLOT_08_09");
        slot1.setStartTime(LocalTime.of(8, 0));
        slot1.setEndTime(LocalTime.of(9, 0));
        slot1.setIsActive(true);

        slot2 = new TimeSlotEntity();
        slot2.setId(2L);
        slot2.setSlotCode("SLOT_09_10");
        slot2.setStartTime(LocalTime.of(9, 0));
        slot2.setEndTime(LocalTime.of(10, 0));
        slot2.setIsActive(true);
    }

    @Test
    void createBooking_success_whenSlotsAvailable() {
        when(timeSlotRepository.findByIdInAndIsActiveTrue(List.of(1L, 2L))).thenReturn(List.of(slot1, slot2));
        doNothing().when(roomValidationService).validateRoomBookable(request.getRoomId(), request.getBookingDate(), List.of(slot1, slot2));
        when(bookingTimeSlotRepository.findBookedSlotIds(request.getRoomId(), request.getBookingDate(), List.of(1L, 2L)))
                .thenReturn(List.of());

        BookingEntity saved = new BookingEntity();
        saved.setId(10L);
        saved.setBookingCode("BK-2026-ABCDEF12");
        saved.setRoomId(request.getRoomId());
        saved.setUserId(request.getUserId());
        saved.setBookingDate(request.getBookingDate());
        saved.setStatus(BookingStatus.PENDING);
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(saved);
        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(2, response.getSlots().size());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        verify(roomValidationService).validateRoomBookable(request.getRoomId(), request.getBookingDate(), List.of(slot1, slot2));
    }

    @Test
    void createBooking_throw_whenConflictExists() {
        when(timeSlotRepository.findByIdInAndIsActiveTrue(List.of(1L, 2L))).thenReturn(List.of(slot1, slot2));
        doNothing().when(roomValidationService).validateRoomBookable(request.getRoomId(), request.getBookingDate(), List.of(slot1, slot2));
        when(bookingTimeSlotRepository.findBookedSlotIds(request.getRoomId(), request.getBookingDate(), List.of(1L, 2L)))
                .thenReturn(List.of(2L));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(request));

        assertTrue(ex.getMessage().contains("already booked"));
    }

    @Test
    void cancelBooking_success() {
        BookingEntity existing = new BookingEntity();
        existing.setId(9L);
        existing.setRoomId(101L);
        existing.setUserId("user-1");
        existing.setBookingDate(LocalDate.now().plusDays(1));
        existing.setStatus(BookingStatus.PENDING);

        BookingTimeSlotEntity bookingSlot = new BookingTimeSlotEntity();
        bookingSlot.setBookingId(9L);
        bookingSlot.setTimeSlotId(1L);
        bookingSlot.setStartTime(LocalTime.of(8, 0));
        bookingSlot.setEndTime(LocalTime.of(9, 0));

        when(bookingRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingTimeSlotRepository.findByBookingIdOrderByStartTimeAsc(9L)).thenReturn(List.of(bookingSlot));
        when(timeSlotRepository.findByIdInAndIsActiveTrue(List.of(1L))).thenReturn(List.of(slot1));

        BookingResponse response = bookingService.cancelBooking(9L);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void getAvailability_marksBookedSlots() {
        when(timeSlotRepository.findByIsActiveTrueOrderByStartTimeAsc()).thenReturn(List.of(slot1, slot2));
        when(bookingTimeSlotRepository.findAllBookedSlotIds(101L, request.getBookingDate())).thenReturn(List.of(2L));

        BookingAvailabilityResponse response = bookingService.getAvailability(101L, request.getBookingDate());

        assertEquals(2, response.getSlots().size());
        assertTrue(response.getSlots().stream().anyMatch(s -> s.getId().equals(1L) && s.getAvailable()));
        assertTrue(response.getSlots().stream().anyMatch(s -> s.getId().equals(2L) && !s.getAvailable()));
    }
}
