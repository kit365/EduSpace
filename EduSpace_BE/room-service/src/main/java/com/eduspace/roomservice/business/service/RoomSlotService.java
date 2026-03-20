package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomSlotRequest;
import com.eduspace.roomservice.model.dto.response.RoomSlotResponse;
import java.util.List;

public interface RoomSlotService {

    List<RoomSlotResponse> getAll();

    List<RoomSlotResponse> getByRoomId(Integer roomId);

    RoomSlotResponse getById(Integer id);

    RoomSlotResponse create(RoomSlotRequest request);

    RoomSlotResponse update(Integer id, RoomSlotRequest request);

    void deleteById(Integer id);
}
