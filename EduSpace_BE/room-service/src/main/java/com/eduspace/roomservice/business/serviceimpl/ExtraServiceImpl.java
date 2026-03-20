package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.ExtraServiceService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.ExtraServiceRequest;
import com.eduspace.roomservice.model.dto.response.ExtraServiceResponse;
import com.eduspace.roomservice.model.entity.ExtraServiceEntity;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.mapper.ExtraServiceMapper;
import com.eduspace.roomservice.persistence.repository.ExtraServiceRepository;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExtraServiceImpl implements ExtraServiceService {

    private final ExtraServiceRepository extraServiceRepository;
    private final PropertyRepository propertyRepository;
    private final ExtraServiceMapper extraServiceMapper;

    @Override
    public List<ExtraServiceResponse> getAll() {
        return extraServiceMapper.toResponseList(extraServiceRepository.findAll());
    }

    @Override
    public List<ExtraServiceResponse> getByPropertyId(Integer propertyId) {
        return extraServiceMapper.toResponseList(extraServiceRepository.findByProperty_Id(propertyId));
    }

    @Override
    public ExtraServiceResponse getById(Integer id) {
        ExtraServiceEntity entity = extraServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXTRA_SERVICE_NOT_FOUND));
        return extraServiceMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public ExtraServiceResponse create(ExtraServiceRequest request) {
        ExtraServiceEntity entity = extraServiceMapper.toEntity(request);
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            entity.setProperty(property);
        }
        return extraServiceMapper.toResponse(extraServiceRepository.save(entity));
    }

    @Override
    @Transactional
    public ExtraServiceResponse update(Integer id, ExtraServiceRequest request) {
        ExtraServiceEntity existing = extraServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXTRA_SERVICE_NOT_FOUND));
        extraServiceMapper.updateEntity(request, existing);
        if (request.getPropertyId() != null) {
            PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
            existing.setProperty(property);
        }
        return extraServiceMapper.toResponse(extraServiceRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!extraServiceRepository.existsById(id)) throw new AppException(ErrorCode.EXTRA_SERVICE_NOT_FOUND);
        extraServiceRepository.deleteById(id);
    }
}
