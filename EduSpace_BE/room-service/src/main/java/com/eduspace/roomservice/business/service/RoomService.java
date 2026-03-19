package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByPropertyId(Integer propertyId);

    RoomResponse getRoomById(Integer id);

    RoomResponse getRoomBySlug(String slug);

    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void deleteById(Integer id);
}
