package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomScheduleItemRequest;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import java.util.List;

public interface RoomScheduleService {

    List<RoomScheduleResponse> listByRoomId(Integer roomId);

    void replaceSchedules(Integer roomId, String ownerId, List<RoomScheduleItemRequest> items);

    /** T2–T7 mở 07:00–22:00, CN nghỉ — khớp default operating_days cũ. */
    void seedDefaultsForNewRoom(Integer roomId);
}
