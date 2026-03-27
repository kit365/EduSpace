package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.AmenityService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.AmenityRequest;
import com.eduspace.roomservice.model.dto.response.AmenityResponse;
import com.eduspace.roomservice.model.entity.AmenityEntity;
import com.eduspace.roomservice.model.mapper.AmenityMapper;
import com.eduspace.roomservice.persistence.repository.AmenityRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;
    private final AmenityMapper amenityMapper;

    @Override
    public List<AmenityResponse> getAll() {
        return amenityMapper.toResponseList(amenityRepository.findAll());
    }

    @Override
    public AmenityResponse getById(Integer id) {
        AmenityEntity entity = amenityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
        return amenityMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public AmenityResponse create(AmenityRequest request) {
        AmenityEntity entity = amenityMapper.toEntity(request);
        return amenityMapper.toResponse(amenityRepository.save(entity));
    }

    @Override
    @Transactional
    public AmenityResponse update(Integer id, AmenityRequest request) {
        AmenityEntity existing = amenityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
        amenityMapper.updateEntity(request, existing);
        return amenityMapper.toResponse(amenityRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!amenityRepository.existsById(id)) throw new AppException(ErrorCode.AMENITY_NOT_FOUND);
        amenityRepository.deleteById(id);
    }
}
