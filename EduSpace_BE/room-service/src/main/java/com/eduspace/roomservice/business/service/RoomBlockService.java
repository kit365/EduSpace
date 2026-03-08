package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import java.util.List;

public interface RoomBlockService {

    List<RoomBlockResponse> getAll();

    List<RoomBlockResponse> getByRoomId(Integer roomId);

    RoomBlockResponse getById(Integer id);

    RoomBlockResponse create(RoomBlockRequest request);

    RoomBlockResponse update(Integer id, RoomBlockRequest request);

    void deleteById(Integer id);
}
