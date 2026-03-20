package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.PropertyService;
import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Properties.BASE_PATH)
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ApiResponse<List<PropertyResponse>> getAll() {
        return ApiResponse.success(propertyService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(propertyService.getById(id));
    }

    @PostMapping
    public ApiResponse<PropertyResponse> create(@RequestBody PropertyRequest request) {
        return ApiResponse.success(propertyService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PropertyResponse> update(@PathVariable Integer id, @RequestBody PropertyRequest request) {
        return ApiResponse.success(propertyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        propertyService.deleteById(id);
        return ApiResponse.success(null);
    }
}
