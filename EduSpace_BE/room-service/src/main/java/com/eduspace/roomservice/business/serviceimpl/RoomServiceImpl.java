package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.RoomMapper;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final RoomMapper roomMapper;

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomMapper.toResponseList(roomRepository.findAll());
    }

    @Override
    public List<RoomResponse> getRoomsByPropertyId(Integer propertyId) {
        return roomMapper.toResponseList(roomRepository.findByProperty_Id(propertyId));
    }

    @Override
    public RoomResponse getRoomById(Integer id) {
        RoomEntity entity = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return roomMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        RoomEntity entity = roomMapper.toEntity(request);
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            entity.setProperty(property);
        }
        return roomMapper.toResponse(roomRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        RoomEntity existing = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        roomMapper.updateEntity(request, existing);
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            existing.setProperty(property);
        }
        return roomMapper.toResponse(roomRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomRepository.existsById(id)) throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        roomRepository.deleteById(id);
    }
}
