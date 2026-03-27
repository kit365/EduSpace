package com.eduspace.roomservice.presentation.controller.unauthenticated;

import com.eduspace.roomservice.business.service.PropertyService;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.Properties.PUBLIC_PATH)
@RequiredArgsConstructor
public class PublicPropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ApiResponse<List<PropertyResponse>> getAll() {
        return ApiResponse.success(propertyService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(propertyService.getById(id));
    }
}
