package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomBlockService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.entity.RoomBlockEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.RoomBlockMapper;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;
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
    private final PropertyRepository propertyRepository;
    private final RoomBlockMapper roomBlockMapper;

    @Override
    public List<RoomBlockResponse> getAll() {
        return roomBlockMapper.toResponseList(roomBlockRepository.findAll());
    }

    @Override
    public List<RoomBlockResponse> getByPropertyId(Integer propertyId) {
        return roomBlockMapper.toResponseList(roomBlockRepository.findByProperty_Id(propertyId));
    }

    @Override
    public List<RoomBlockResponse> getByRoomId(Integer roomId) {
        RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getProperty() == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        Integer propertyId = room.getProperty().getId();
        // Nếu block theo "cơ sở" thì room_id = null → vẫn áp dụng cho mọi phòng.
        // Nếu block theo "phòng" thì chỉ áp dụng đúng phòng đó.
        return roomBlockMapper.toResponseList(
                roomBlockRepository.findByProperty_Id(propertyId).stream()
                        .filter(b -> b.getRoom() == null || (b.getRoom() != null && b.getRoom().getId().equals(roomId)))
                        .toList()
        );
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
        PropertyEntity property = resolveProperty(request);
        entity.setProperty(property);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            if (room.getProperty() == null) {
                throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
            }
            // Nếu FE gửi propertyId + roomId, đảm bảo khớp về cùng cơ sở.
            if (request.getPropertyId() != null && !room.getProperty().getId().equals(property.getId())) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            entity.setRoom(room);
        } else {
            entity.setRoom(null);
        }
        return roomBlockMapper.toResponse(roomBlockRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomBlockResponse update(Integer id, RoomBlockRequest request) {
        RoomBlockEntity existing = roomBlockRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_BLOCK_NOT_FOUND));
        roomBlockMapper.updateEntity(request, existing);
        if (request.getPropertyId() != null || request.getRoomId() != null) {
            existing.setProperty(resolveProperty(request));
        }
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            if (room.getProperty() == null) {
                throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
            }
            if (request.getPropertyId() != null && !room.getProperty().getId().equals(existing.getProperty().getId())) {
                throw new AppException(ErrorCode.INVALID_KEY);
            }
            existing.setRoom(room);
        } else if (request.getRoomId() == null) {
            // Cho phép FE tắt room scope (set room_id = null) khi cập nhật.
            existing.setRoom(null);
        }
        return roomBlockMapper.toResponse(roomBlockRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomBlockRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROOM_BLOCK_NOT_FOUND);
        }
        roomBlockRepository.deleteById(id);
    }

    private PropertyEntity resolveProperty(RoomBlockRequest request) {
        if (request.getPropertyId() != null) {
            return propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        }
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            if (room.getProperty() == null) {
                throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
            }
            return room.getProperty();
        }
        throw new AppException(ErrorCode.INVALID_KEY);
    }
}
