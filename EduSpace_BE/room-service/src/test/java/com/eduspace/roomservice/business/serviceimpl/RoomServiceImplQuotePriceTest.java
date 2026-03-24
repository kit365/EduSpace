package com.eduspace.roomservice.business.serviceimpl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.model.dto.request.RoomPriceQuoteRequest;
import com.eduspace.roomservice.model.dto.response.RoomPriceQuoteResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomPriceRuleEntity;
import com.eduspace.roomservice.model.mapper.RoomMapper;
import com.eduspace.roomservice.model.mapper.RoomPolicyMapper;
import com.eduspace.roomservice.persistence.repository.AmenityRepository;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomCategoryRepository;
import com.eduspace.roomservice.persistence.repository.RoomPriceRuleRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RoomServiceImplQuotePriceTest {

    @Mock private RoomRepository roomRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private RoomCategoryRepository categoryRepository;
    @Mock private AmenityRepository amenityRepository;
    @Mock private RoomPriceRuleRepository roomPriceRuleRepository;
    @Mock private RoomScheduleService roomScheduleService;
    @Mock private RoomMapper roomMapper;
    @Mock private RoomPolicyMapper roomPolicyMapper;

    private RoomServiceImpl roomService;

    @BeforeEach
    void setUp() {
        roomService = new RoomServiceImpl(
                roomRepository,
                propertyRepository,
                categoryRepository,
                amenityRepository,
                roomPriceRuleRepository,
                new ObjectMapper(),
                roomScheduleService,
                roomMapper,
                roomPolicyMapper
        );
    }

    @Test
    void quotePrice_shouldApplySaturdaySurcharge_whenEnabledAndSaturdaySelected() {
        RoomEntity room = RoomEntity.builder()
                .id(100)
                .minDuration(30)
                .stepUnit(30)
                .pricePerHour(BigDecimal.valueOf(120_000))
                .weekendSurchargeEnabled(true)
                .weekendSurchargePercent(BigDecimal.valueOf(10))
                .weekendApplySaturday(true)
                .weekendApplySunday(false)
                .build();
        RoomPriceRuleEntity rule = RoomPriceRuleEntity.builder()
                .id(1)
                .room(room)
                .minHours(1)
                .maxHours(4)
                .pricePerHour(BigDecimal.valueOf(100_000))
                .build();

        when(roomRepository.findByIdAndDeletedAtIsNull(100)).thenReturn(Optional.of(room));
        when(roomPriceRuleRepository.findByRoom_IdOrderByIdAsc(100)).thenReturn(List.of(rule));

        RoomPriceQuoteRequest request = RoomPriceQuoteRequest.builder()
                .durationMinutes(120)
                .startDateTime("2026-03-28T09:00:00")
                .endDateTime("2026-03-28T11:00:00")
                .build();

        RoomPriceQuoteResponse response = roomService.quotePrice(100, request);

        assertEquals(new BigDecimal("200000.00"), response.getSubtotal());
        assertTrue(response.isWeekendSurchargeApplied());
        assertEquals(new BigDecimal("20000.00"), response.getWeekendSurchargeAmount());
        assertEquals(new BigDecimal("220000.00"), response.getTotal());
    }

    @Test
    void quotePrice_shouldNotApplySaturdaySurcharge_whenOnlySundayIsEnabled() {
        RoomEntity room = RoomEntity.builder()
                .id(101)
                .minDuration(30)
                .stepUnit(30)
                .pricePerHour(BigDecimal.valueOf(120_000))
                .weekendSurchargeEnabled(true)
                .weekendSurchargePercent(BigDecimal.valueOf(15))
                .weekendApplySaturday(false)
                .weekendApplySunday(true)
                .build();

        when(roomRepository.findByIdAndDeletedAtIsNull(101)).thenReturn(Optional.of(room));
        when(roomPriceRuleRepository.findByRoom_IdOrderByIdAsc(101)).thenReturn(List.of());

        RoomPriceQuoteRequest request = RoomPriceQuoteRequest.builder()
                .durationMinutes(120)
                .startDateTime("2026-03-28T09:00:00")
                .endDateTime("2026-03-28T11:00:00")
                .build();

        RoomPriceQuoteResponse response = roomService.quotePrice(101, request);

        assertFalse(response.isWeekendSurchargeApplied());
        assertEquals(0, response.getWeekendSurchargeAmount().compareTo(BigDecimal.ZERO));
        assertEquals(new BigDecimal("240000.00"), response.getTotal());
    }

    @Test
    void quotePrice_shouldIgnoreRule_whenBookingStartsOnNonApplicableWeekday() {
        RoomEntity room = RoomEntity.builder()
                .id(102)
                .minDuration(30)
                .stepUnit(30)
                .pricePerHour(BigDecimal.valueOf(60_000))
                .weekendSurchargeEnabled(false)
                .build();
        RoomPriceRuleEntity rule = RoomPriceRuleEntity.builder()
                .id(9)
                .room(room)
                .minHours(1)
                .maxHours(4)
                .pricePerHour(BigDecimal.valueOf(100_000))
                .applicableDayOfWeeks(Set.of(2))
                .build();

        when(roomRepository.findByIdAndDeletedAtIsNull(102)).thenReturn(Optional.of(room));
        when(roomPriceRuleRepository.findByRoom_IdOrderByIdAsc(102)).thenReturn(List.of(rule));

        RoomPriceQuoteRequest request = RoomPriceQuoteRequest.builder()
                .durationMinutes(120)
                .startDateTime("2026-03-28T10:00:00")
                .endDateTime("2026-03-28T12:00:00")
                .build();

        RoomPriceQuoteResponse response = roomService.quotePrice(102, request);

        assertEquals("ROOM_DEFAULT_PER_UNIT", response.getPricingMode());
        assertEquals(new BigDecimal("120000.00"), response.getSubtotal());
    }
}
