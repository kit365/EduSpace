package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomSlotService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomSlotRequest;
import com.eduspace.roomservice.model.dto.response.RoomSlotResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.entity.RoomSlotEntity;
import com.eduspace.roomservice.model.mapper.RoomSlotMapper;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import com.eduspace.roomservice.persistence.repository.RoomSlotRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomSlotServiceImpl implements RoomSlotService {

    private final RoomSlotRepository roomSlotRepository;
    private final RoomRepository roomRepository;
    private final RoomSlotMapper roomSlotMapper;

    @Override
    public List<RoomSlotResponse> getAll() {
        return roomSlotMapper.toResponseList(roomSlotRepository.findAll());
    }

    @Override
    public List<RoomSlotResponse> getByRoomId(Integer roomId) {
        return roomSlotMapper.toResponseList(roomSlotRepository.findByRoom_Id(roomId));
    }

    @Override
    public RoomSlotResponse getById(Integer id) {
        RoomSlotEntity entity = roomSlotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_SLOT_NOT_FOUND));
        return roomSlotMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoomSlotResponse create(RoomSlotRequest request) {
        RoomSlotEntity entity = roomSlotMapper.toEntity(request);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            entity.setRoom(room);
        }
        return roomSlotMapper.toResponse(roomSlotRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomSlotResponse update(Integer id, RoomSlotRequest request) {
        RoomSlotEntity existing = roomSlotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_SLOT_NOT_FOUND));
        roomSlotMapper.updateEntity(request, existing);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            existing.setRoom(room);
        }
        return roomSlotMapper.toResponse(roomSlotRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomSlotRepository.existsById(id)) throw new AppException(ErrorCode.ROOM_SLOT_NOT_FOUND);
        roomSlotRepository.deleteById(id);
    }
}
