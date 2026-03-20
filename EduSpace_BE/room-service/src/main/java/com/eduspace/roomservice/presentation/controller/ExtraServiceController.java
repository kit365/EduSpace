package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.ExtraServiceService;
import com.eduspace.roomservice.model.dto.request.ExtraServiceRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.ExtraServiceResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.ExtraServices.BASE_PATH)
@RequiredArgsConstructor
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;

    @GetMapping
    public ApiResponse<List<ExtraServiceResponse>> getAll(@RequestParam(required = false) Integer propertyId) {
        if (propertyId != null) {
            return ApiResponse.success(extraServiceService.getByPropertyId(propertyId));
        }
        return ApiResponse.success(extraServiceService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<ExtraServiceResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(extraServiceService.getById(id));
    }

    @PostMapping
    public ApiResponse<ExtraServiceResponse> create(@RequestBody ExtraServiceRequest request) {
        return ApiResponse.success(extraServiceService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ExtraServiceResponse> update(@PathVariable Integer id, @RequestBody ExtraServiceRequest request) {
        return ApiResponse.success(extraServiceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        extraServiceService.deleteById(id);
        return ApiResponse.success(null);
    }
}
