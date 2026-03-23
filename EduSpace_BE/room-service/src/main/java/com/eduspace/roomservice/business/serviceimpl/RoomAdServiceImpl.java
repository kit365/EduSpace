package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.RoomAdService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.RoomAdRequest;
import com.eduspace.roomservice.model.dto.response.RoomAdResponse;
import com.eduspace.roomservice.model.entity.AdsPackageEntity;
import com.eduspace.roomservice.model.entity.RoomAdEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.RoomAdMapper;
import com.eduspace.roomservice.persistence.repository.AdsPackageRepository;
import com.eduspace.roomservice.persistence.repository.RoomAdRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomAdServiceImpl implements RoomAdService {

    private final RoomAdRepository roomAdRepository;
    private final RoomRepository roomRepository;
    private final AdsPackageRepository adsPackageRepository;
    private final RoomAdMapper roomAdMapper;

    @Override
    public List<RoomAdResponse> getAll() {
        return roomAdMapper.toResponseList(roomAdRepository.findAll());
    }

    @Override
    public List<RoomAdResponse> getByRoomId(Integer roomId) {
        return roomAdMapper.toResponseList(roomAdRepository.findByRoom_Id(roomId));
    }

    @Override
    public RoomAdResponse getById(Integer id) {
        RoomAdEntity entity = roomAdRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_AD_NOT_FOUND));
        return roomAdMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoomAdResponse create(RoomAdRequest request) {
        RoomAdEntity entity = roomAdMapper.toEntity(request);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            entity.setRoom(room);
        }
        if (request.getAdsPackageId() != null) {
            AdsPackageEntity pkg = adsPackageRepository.findById(request.getAdsPackageId())
                    .orElseThrow(() -> new AppException(ErrorCode.ADS_PACKAGE_NOT_FOUND));
            entity.setAdsPackage(pkg);
        }
        return roomAdMapper.toResponse(roomAdRepository.save(entity));
    }

    @Override
    @Transactional
    public RoomAdResponse update(Integer id, RoomAdRequest request) {
        RoomAdEntity existing = roomAdRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_AD_NOT_FOUND));
        roomAdMapper.updateEntity(request, existing);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            existing.setRoom(room);
        }
        if (request.getAdsPackageId() != null) {
            AdsPackageEntity pkg = adsPackageRepository.findById(request.getAdsPackageId())
                    .orElseThrow(() -> new AppException(ErrorCode.ADS_PACKAGE_NOT_FOUND));
            existing.setAdsPackage(pkg);
        }
        return roomAdMapper.toResponse(roomAdRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!roomAdRepository.existsById(id)) throw new AppException(ErrorCode.ROOM_AD_NOT_FOUND);
        roomAdRepository.deleteById(id);
    }
}
