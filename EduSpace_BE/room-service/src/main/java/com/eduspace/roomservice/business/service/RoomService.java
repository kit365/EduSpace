package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByPropertyId(Integer propertyId);

    List<RoomResponse> getRoomsByOwnerId(String ownerId);

    RoomResponse getRoomById(Integer id);

    RoomResponse getRoomBySlug(String slug);

    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    RoomResponse updateStatus(Integer id, RoomStatus status);

    void deleteById(Integer id);

    RoomResponse submitPendingEdit(Integer roomId, RoomRequest request, String ownerId);

    RoomResponse approvePendingEdit(Integer roomId);

    RoomResponse rejectPendingEdit(Integer roomId, String rejectionNote);
}
