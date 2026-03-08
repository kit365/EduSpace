package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByFacilityId(Integer facilityId);

    RoomResponse getRoomById(Integer id);

    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void deleteById(Integer id);
}
