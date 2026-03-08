package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.FacilityService;
import com.eduspace.roomservice.model.dto.request.FacilityRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.FacilityResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Facilities.BASE_PATH)
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    public ApiResponse<List<FacilityResponse>> getAll() {
        return ApiResponse.success(facilityService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<FacilityResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(facilityService.getById(id));
    }

    @PostMapping
    public ApiResponse<FacilityResponse> create(@RequestBody FacilityRequest request) {
        return ApiResponse.success(facilityService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<FacilityResponse> update(@PathVariable Integer id, @RequestBody FacilityRequest request) {
        return ApiResponse.success(facilityService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        facilityService.deleteById(id);
        return ApiResponse.success(null);
    }
}
