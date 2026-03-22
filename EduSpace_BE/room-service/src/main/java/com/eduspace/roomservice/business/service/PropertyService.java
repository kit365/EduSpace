package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.request.PropertyModerationRequest;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;

import java.util.List;

public interface PropertyService {

    List<PropertyResponse> getAll();

    PropertyResponse getById(Integer id);

    PropertyResponse create(PropertyRequest request);

    PropertyResponse update(Integer id, PropertyRequest request);

    PropertyResponse approve(Integer id, PropertyModerationRequest request);

    PropertyResponse reject(Integer id, PropertyModerationRequest request);

    void deleteById(Integer id);
}
