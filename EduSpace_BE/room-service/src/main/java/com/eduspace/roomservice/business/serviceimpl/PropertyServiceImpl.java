package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.PropertyService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.mapper.PropertyMapper;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    @Override
    public List<PropertyResponse> getAll() {
        return propertyMapper.toResponseList(propertyRepository.findAll());
    }

    @Override
    public PropertyResponse getById(Integer id) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        return propertyMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PropertyResponse create(PropertyRequest request) {
        PropertyEntity entity = propertyMapper.toEntity(request);
        return propertyMapper.toResponse(propertyRepository.save(entity));
    }

    @Override
    @Transactional
    public PropertyResponse update(Integer id, PropertyRequest request) {
        PropertyEntity existing = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        propertyMapper.updateEntity(request, existing);
        return propertyMapper.toResponse(propertyRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!propertyRepository.existsById(id)) throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        propertyRepository.deleteById(id);
    }
}
