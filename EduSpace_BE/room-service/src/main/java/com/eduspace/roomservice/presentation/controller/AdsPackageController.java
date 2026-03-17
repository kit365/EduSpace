package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.AdsPackageService;
import com.eduspace.roomservice.model.dto.request.AdsPackageRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.AdsPackageResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.AdsPackages.BASE_PATH)
@RequiredArgsConstructor
public class AdsPackageController {

    private final AdsPackageService adsPackageService;

    @GetMapping
    public ApiResponse<List<AdsPackageResponse>> getAll() {
        return ApiResponse.success(adsPackageService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<AdsPackageResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(adsPackageService.getById(id));
    }

    @PostMapping
    public ApiResponse<AdsPackageResponse> create(@RequestBody AdsPackageRequest request) {
        return ApiResponse.success(adsPackageService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdsPackageResponse> update(@PathVariable Integer id, @RequestBody AdsPackageRequest request) {
        return ApiResponse.success(adsPackageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        adsPackageService.deleteById(id);
        return ApiResponse.success(null);
    }
}
