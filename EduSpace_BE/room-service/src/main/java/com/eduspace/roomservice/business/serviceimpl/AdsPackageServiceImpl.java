package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.AdsPackageService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.AdsPackageRequest;
import com.eduspace.roomservice.model.dto.response.AdsPackageResponse;
import com.eduspace.roomservice.model.entity.AdsPackageEntity;
import com.eduspace.roomservice.model.mapper.AdsPackageMapper;
import com.eduspace.roomservice.persistence.repository.AdsPackageRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdsPackageServiceImpl implements AdsPackageService {

    private final AdsPackageRepository adsPackageRepository;
    private final AdsPackageMapper adsPackageMapper;

    @Override
    public List<AdsPackageResponse> getAll() {
        return adsPackageMapper.toResponseList(adsPackageRepository.findAll());
    }

    @Override
    public AdsPackageResponse getById(Integer id) {
        AdsPackageEntity entity = adsPackageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADS_PACKAGE_NOT_FOUND));
        return adsPackageMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public AdsPackageResponse create(AdsPackageRequest request) {
        AdsPackageEntity entity = adsPackageMapper.toEntity(request);
        return adsPackageMapper.toResponse(adsPackageRepository.save(entity));
    }

    @Override
    @Transactional
    public AdsPackageResponse update(Integer id, AdsPackageRequest request) {
        AdsPackageEntity existing = adsPackageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADS_PACKAGE_NOT_FOUND));
        adsPackageMapper.updateEntity(request, existing);
        return adsPackageMapper.toResponse(adsPackageRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!adsPackageRepository.existsById(id)) throw new AppException(ErrorCode.ADS_PACKAGE_NOT_FOUND);
        adsPackageRepository.deleteById(id);
    }
}
