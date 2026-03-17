package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.AdsPackageRequest;
import com.eduspace.roomservice.model.dto.response.AdsPackageResponse;
import com.eduspace.roomservice.model.entity.AdsPackageEntity;
import java.util.List;

public interface AdsPackageService {

    List<AdsPackageResponse> getAll();

    AdsPackageResponse getById(Integer id);

    AdsPackageResponse create(AdsPackageRequest request);

    AdsPackageResponse update(Integer id, AdsPackageRequest request);

    void deleteById(Integer id);
}
