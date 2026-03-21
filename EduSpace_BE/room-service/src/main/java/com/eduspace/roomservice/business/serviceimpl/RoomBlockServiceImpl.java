package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomBlockService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import com.eduspace.roomservice.model.entity.RoomBlockEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.RoomBlockMapper;
import com.eduspace.roomservice.persistence.repository.RoomBlockRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomBlockServiceImpl implements RoomBlockService {

    private final RoomBlockRepository roomBlockRepository;
    private final RoomRepository roomRepository;
    private final RoomBlockMapper roomBlockMapper;

    @Override
    public List<RoomBlockResponse> getAll() {
        return roomBlockMapper.toResponseList(roomBlockRepository.findAll());
    }

    @Override
    public List<RoomBlockResponse> getByRoomId(Integer roomId) {
        return roomBlockMapper.toResponseList(roomBlockRepository.findByRoom_Id(roomId));
    }

    @Override
    public RoomBlockResponse getById(Integer id) {
        RoomBlockEntity entity = roomBlockRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_BLOCK_NOT_FOUND));
        return roomBlockMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoomBlockResponse create(RoomBlockRequest request) {
        RoomBlockEntity entity = roomBlockMapper.toEntity(request);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            entity.setRoom(room);
        }
        return roomBlockMapper.toResponse(roomBlockRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomBlockResponse update(Integer id, RoomBlockRequest request) {
        RoomBlockEntity existing = roomBlockRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_BLOCK_NOT_FOUND));
        roomBlockMapper.updateEntity(request, existing);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            existing.setRoom(room);
        }
        return roomBlockMapper.toResponse(roomBlockRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomBlockRepository.existsById(id)) throw new AppException(ErrorCode.ROOM_BLOCK_NOT_FOUND);
        roomBlockRepository.deleteById(id);
    }
}
