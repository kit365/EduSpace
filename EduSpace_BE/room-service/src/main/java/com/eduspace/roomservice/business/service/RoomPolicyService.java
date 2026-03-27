package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomPolicyRequest;
import com.eduspace.roomservice.model.dto.response.RoomPolicyResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomPolicyEntity;

import java.util.List;

public interface RoomPolicyService {
    List<RoomPolicyResponse> listByRoomId(Integer roomId);
    List<RoomPolicyEntity> listEntitiesByRoomId(Integer roomId);
    void savePolicies(RoomEntity room, List<RoomPolicyRequest> requests);
    void updatePolicies(RoomEntity room, List<RoomPolicyRequest> requests);
}
