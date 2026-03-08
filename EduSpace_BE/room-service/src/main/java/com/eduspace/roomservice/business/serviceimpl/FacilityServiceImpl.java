package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.FacilityService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.FacilityRequest;
import com.eduspace.roomservice.model.dto.response.FacilityResponse;
import com.eduspace.roomservice.model.entity.FacilityEntity;
import com.eduspace.roomservice.model.mapper.FacilityMapper;
import com.eduspace.roomservice.persistence.repository.FacilityRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final FacilityMapper facilityMapper;

    @Override
    public List<FacilityResponse> getAll() {
        return facilityMapper.toResponseList(facilityRepository.findAll());
    }

    @Override
    public FacilityResponse getById(Integer id) {
        FacilityEntity entity = facilityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FACILITY_NOT_FOUND));
        return facilityMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public FacilityResponse create(FacilityRequest request) {
        FacilityEntity entity = facilityMapper.toEntity(request);
        return facilityMapper.toResponse(facilityRepository.save(entity));
    }

    @Override
    @Transactional
    public FacilityResponse update(Integer id, FacilityRequest request) {
        FacilityEntity existing = facilityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FACILITY_NOT_FOUND));
        facilityMapper.updateEntity(request, existing);
        return facilityMapper.toResponse(facilityRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!facilityRepository.existsById(id)) throw new AppException(ErrorCode.FACILITY_NOT_FOUND);
        facilityRepository.deleteById(id);
    }
}
