package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.ExtraServiceRequest;
import com.eduspace.roomservice.model.dto.response.ExtraServiceResponse;

import java.util.List;

public interface ExtraServiceService {

    List<ExtraServiceResponse> getAll();

    List<ExtraServiceResponse> getByPropertyId(Integer propertyId);

    ExtraServiceResponse getById(Integer id);

    ExtraServiceResponse create(ExtraServiceRequest request);

    ExtraServiceResponse update(Integer id, ExtraServiceRequest request);

    void deleteById(Integer id);
}
