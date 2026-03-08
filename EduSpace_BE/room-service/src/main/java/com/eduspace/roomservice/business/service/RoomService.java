package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.entity.RoomEntity;
import java.util.List;

public interface RoomService {
    List<RoomEntity> getAllRooms();

    RoomEntity getRoomById(String roomId);
}

