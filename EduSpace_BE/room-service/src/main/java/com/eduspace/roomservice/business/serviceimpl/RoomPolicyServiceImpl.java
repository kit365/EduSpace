package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomPolicyService;
import com.eduspace.roomservice.model.dto.request.RoomPolicyRequest;
import com.eduspace.roomservice.model.dto.response.RoomPolicyResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomPolicyEntity;
import com.eduspace.roomservice.model.mapper.RoomPolicyMapper;
import com.eduspace.roomservice.persistence.repository.RoomPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomPolicyServiceImpl implements RoomPolicyService {

    private final RoomPolicyRepository roomPolicyRepository;
    private final RoomPolicyMapper roomPolicyMapper;

    @Override
    public List<RoomPolicyResponse> listByRoomId(Integer roomId) {
        return roomPolicyMapper.toResponseList(roomPolicyRepository.findByRoom_Id(roomId));
    }

    @Override
    public List<RoomPolicyEntity> listEntitiesByRoomId(Integer roomId) {
        return roomPolicyRepository.findByRoom_Id(roomId);
    }

    @Override
    @Transactional
    public void savePolicies(RoomEntity room, List<RoomPolicyRequest> requests) {
        if (requests == null) return;
        List<RoomPolicyEntity> entities = requests.stream()
                .map(req -> {
                    RoomPolicyEntity entity = roomPolicyMapper.toEntity(req);
                    entity.setRoom(room);
                    return entity;
                })
                .toList();
        roomPolicyRepository.saveAll(entities);
    }

    @Override
    @Transactional
    public void updatePolicies(RoomEntity room, List<RoomPolicyRequest> requests) {
        if (requests == null) return;
        // Simple replace-all strategy consistent with other parts of the system
        List<RoomPolicyEntity> existing = roomPolicyRepository.findByRoom_Id(room.getId());
        roomPolicyRepository.deleteAll(existing);
        savePolicies(room, requests);
    }
}
