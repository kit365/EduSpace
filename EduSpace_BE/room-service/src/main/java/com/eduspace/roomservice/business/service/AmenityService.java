package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.AmenityRequest;
import com.eduspace.roomservice.model.dto.response.AmenityResponse;
import java.util.List;

public interface AmenityService {

    List<AmenityResponse> getAll();

    AmenityResponse getById(Integer id);

    AmenityResponse create(AmenityRequest request);

    AmenityResponse update(Integer id, AmenityRequest request);

    void deleteById(Integer id);
}
