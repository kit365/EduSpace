package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomAdRequest;
import com.eduspace.roomservice.model.dto.response.RoomAdResponse;
import java.util.List;

public interface RoomAdService {

    List<RoomAdResponse> getAll();

    List<RoomAdResponse> getByRoomId(Integer roomId);

    RoomAdResponse getById(Integer id);

    RoomAdResponse create(RoomAdRequest request);

    RoomAdResponse update(Integer id, RoomAdRequest request);

    void deleteById(Integer id);
}
