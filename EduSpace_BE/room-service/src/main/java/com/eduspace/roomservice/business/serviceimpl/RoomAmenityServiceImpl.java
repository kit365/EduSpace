package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomAmenityService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomAmenityRequest;
import com.eduspace.roomservice.model.dto.response.RoomAmenityResponse;
import com.eduspace.roomservice.model.entity.AmenityEntity;
import com.eduspace.roomservice.model.entity.RoomAmenityEntity;
import com.eduspace.roomservice.model.entity.RoomAmenityId;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.RoomAmenityMapper;
import com.eduspace.roomservice.persistence.repository.AmenityRepository;
import com.eduspace.roomservice.persistence.repository.RoomAmenityRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomAmenityServiceImpl implements RoomAmenityService {

    private final RoomAmenityRepository roomAmenityRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final RoomAmenityMapper roomAmenityMapper;

    @Override
    public List<RoomAmenityResponse> getAll() {
        return roomAmenityMapper.toResponseList(roomAmenityRepository.findAll());
    }

    @Override
    public List<RoomAmenityResponse> getByRoomId(Integer roomId) {
        return roomAmenityMapper.toResponseList(roomAmenityRepository.findById_RoomId(roomId));
    }

    @Override
    public List<RoomAmenityResponse> getByAmenityId(Integer amenityId) {
        return roomAmenityMapper.toResponseList(roomAmenityRepository.findById_AmenityId(amenityId));
    }

    @Override
    public RoomAmenityResponse getById(Integer roomId, Integer amenityId) {
        RoomAmenityId id = new RoomAmenityId(roomId, amenityId);
        RoomAmenityEntity entity = roomAmenityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_AMENITY_NOT_FOUND));
        return roomAmenityMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoomAmenityResponse create(RoomAmenityRequest request) {
        if (request.getRoomId() == null || request.getAmenityId() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        RoomEntity room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        AmenityEntity amenity = amenityRepository.findById(request.getAmenityId())
                .orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
        RoomAmenityId id = new RoomAmenityId(room.getId(), amenity.getId());
        if (roomAmenityRepository.existsById(id)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        RoomAmenityEntity entity = RoomAmenityEntity.builder()
                .id(id)
                .room(room)
                .amenity(amenity)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .notes(request.getNotes())
                .build();
        return roomAmenityMapper.toResponse(roomAmenityRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomAmenityResponse update(Integer roomId, Integer amenityId, RoomAmenityRequest request) {
        RoomAmenityEntity existing = roomAmenityRepository.findById(new RoomAmenityId(roomId, amenityId))
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_AMENITY_NOT_FOUND));
        if (request.getQuantity() != null) existing.setQuantity(request.getQuantity());
        if (request.getNotes() != null) existing.setNotes(request.getNotes());
        return roomAmenityMapper.toResponse(roomAmenityRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer roomId, Integer amenityId) {
        RoomAmenityId id = new RoomAmenityId(roomId, amenityId);
        if (!roomAmenityRepository.existsById(id)) throw new AppException(ErrorCode.ROOM_AMENITY_NOT_FOUND);
        roomAmenityRepository.deleteById(id);
    }
}
