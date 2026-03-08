package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.FacilityRequest;
import com.eduspace.roomservice.model.dto.response.FacilityResponse;
import java.util.List;

public interface FacilityService {

    List<FacilityResponse> getAll();

    FacilityResponse getById(Integer id);

    FacilityResponse create(FacilityRequest request);

    FacilityResponse update(Integer id, FacilityRequest request);

    void deleteById(Integer id);
}
