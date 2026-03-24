package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomAvailabilityCheckRequest;
import com.eduspace.roomservice.model.dto.request.RoomPricingQuoteRequest;
import com.eduspace.roomservice.model.dto.request.RoomTimeslotItemRequest;
import com.eduspace.roomservice.model.dto.response.RoomAvailabilityCheckResponse;
import com.eduspace.roomservice.model.dto.response.RoomPricingQuoteResponse;
import com.eduspace.roomservice.model.dto.response.RoomTimeslotResponse;
import java.time.LocalDate;
import java.util.List;

public interface RoomTimeslotService {
    List<RoomTimeslotResponse> listByRoomAndDate(Integer roomId, LocalDate bookingDate);

    List<RoomTimeslotResponse> listByRoom(Integer roomId);

    void replaceTimeslots(Integer roomId, String ownerId, List<RoomTimeslotItemRequest> items);

    void seedDefaultsForNewRoom(Integer roomId);

    RoomAvailabilityCheckResponse checkAvailability(Integer roomId, RoomAvailabilityCheckRequest request);

    RoomPricingQuoteResponse quote(Integer roomId, RoomPricingQuoteRequest request);
}
