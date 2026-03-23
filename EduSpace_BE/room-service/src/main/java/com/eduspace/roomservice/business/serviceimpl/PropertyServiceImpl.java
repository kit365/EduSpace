package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.PropertyService;
import com.eduspace.roomservice.common.enums.PropertyType;
import com.eduspace.roomservice.common.enums.PropertyStatus;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.PropertyModerationRequest;
import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import com.eduspace.roomservice.model.mapper.PropertyMapper;
import com.eduspace.roomservice.persistence.repository.PropertyRepository;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    @Override
    public List<PropertyResponse> getAll() {
        return propertyMapper.toResponseList(propertyRepository.findAllByDeletedFalse());
    }

    @Override
    public PropertyResponse getById(Integer id) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (entity.isDeleted()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        return propertyMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PropertyResponse create(PropertyRequest request) {
        PropertyEntity entity = propertyMapper.toEntity(request);
        entity.setPropertyType(normalizePropertyType(request.getPropertyType()));
        entity.setStatus(PropertyStatus.PENDING.name());
        entity.setSubmittedAt(LocalDateTime.now());

        PropertyEntity saved = propertyRepository.save(entity);
        return propertyMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PropertyResponse update(Integer id, PropertyRequest request) {
        PropertyEntity existing = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (existing.isDeleted()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        String currentStatus = existing.getStatus();
        LocalDateTime currentSubmittedAt = existing.getSubmittedAt();
        String currentApprovedBy = existing.getApprovedBy();
        LocalDateTime currentApprovedAt = existing.getApprovedAt();
        String currentRejectionNote = existing.getRejectionNote();

        propertyMapper.updateEntity(request, existing);
        if (request.getPropertyType() != null && !request.getPropertyType().isBlank()) {
            existing.setPropertyType(normalizePropertyType(request.getPropertyType()));
        }
        // Preserve workflow fields for host update requests.
        existing.setStatus(currentStatus);
        existing.setSubmittedAt(currentSubmittedAt);
        existing.setApprovedBy(currentApprovedBy);
        existing.setApprovedAt(currentApprovedAt);
        existing.setRejectionNote(currentRejectionNote);
        PropertyEntity saved = propertyRepository.save(existing);
        return propertyMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PropertyResponse approve(Integer id, PropertyModerationRequest request) {
        PropertyEntity existing = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (existing.isDeleted()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        existing.setStatus(PropertyStatus.VERIFIED.name());
        existing.setApprovedAt(LocalDateTime.now());
        existing.setApprovedBy("admin");
        existing.setRejectionNote(null);
        return propertyMapper.toResponse(propertyRepository.save(existing));
    }

    @Override
    @Transactional
    public PropertyResponse reject(Integer id, PropertyModerationRequest request) {
        PropertyEntity existing = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (existing.isDeleted()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }
        existing.setStatus(PropertyStatus.REJECTED.name());
        existing.setRejectionNote(
                StringUtils.hasText(request.getRejectionNote()) ? request.getRejectionNote().trim() : null);
        existing.setApprovedAt(null);
        existing.setApprovedBy(null);
        return propertyMapper.toResponse(propertyRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
        if (entity.isDeleted()) {
            return;
        }
        entity.setDeleted(true);
        entity.setUpdatedAt(LocalDateTime.now());
        propertyRepository.save(entity);
    }

    private String normalizePropertyType(String raw) {
        if (raw == null || raw.isBlank()) {
            return PropertyType.INDEPENDENT_SPACE.name();
        }

        String value = raw.trim().toUpperCase();
        // Backward compatibility for older FE values.
        if ("PRIVATE_ROOM".equals(value) || "HOMESTAY".equals(value) || "APARTMENT".equals(value)) {
            return PropertyType.INDEPENDENT_SPACE.name();
        }
        if ("HOTEL".equals(value) || "COMMERCIAL".equals(value)) {
            return PropertyType.COMMERCIAL_BUILDING.name();
        }
        if ("COWORKING".equals(value) || "CENTER".equals(value)) {
            return PropertyType.CENTER_COWORKING.name();
        }

        try {
            return PropertyType.valueOf(value).name();
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

}
