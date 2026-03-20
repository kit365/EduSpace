package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.AmenityService;
import com.eduspace.roomservice.model.dto.request.AmenityRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.AmenityResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Amenities.BASE_PATH)
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public ApiResponse<List<AmenityResponse>> getAll() {
        return ApiResponse.success(amenityService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<AmenityResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(amenityService.getById(id));
    }

    @PostMapping
    public ApiResponse<AmenityResponse> create(@RequestBody AmenityRequest request) {
        return ApiResponse.success(amenityService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AmenityResponse> update(@PathVariable Integer id, @RequestBody AmenityRequest request) {
        return ApiResponse.success(amenityService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        amenityService.deleteById(id);
        return ApiResponse.success(null);
    }
}
