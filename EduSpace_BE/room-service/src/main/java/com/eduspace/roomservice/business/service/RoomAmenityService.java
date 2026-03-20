package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomAmenityRequest;
import com.eduspace.roomservice.model.dto.response.RoomAmenityResponse;
import java.util.List;

public interface RoomAmenityService {

    List<RoomAmenityResponse> getAll();

    List<RoomAmenityResponse> getByRoomId(Integer roomId);

    List<RoomAmenityResponse> getByAmenityId(Integer amenityId);

    RoomAmenityResponse getById(Integer roomId, Integer amenityId);

    RoomAmenityResponse create(RoomAmenityRequest request);

    RoomAmenityResponse update(Integer roomId, Integer amenityId, RoomAmenityRequest request);

    void deleteById(Integer roomId, Integer amenityId);
}
