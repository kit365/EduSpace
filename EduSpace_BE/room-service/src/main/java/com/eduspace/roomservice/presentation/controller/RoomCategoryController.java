package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomCategoryService;
import com.eduspace.roomservice.model.dto.request.RoomCategoryRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomCategoryResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.RoomCategories.BASE_PATH)
@RequiredArgsConstructor
public class RoomCategoryController {

    private final RoomCategoryService categoryService;

    @GetMapping
    public ApiResponse<List<RoomCategoryResponse>> getAll() {
        return ApiResponse.success(categoryService.getAllCategories());
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomCategoryResponse> update(@PathVariable Integer id, @RequestBody RoomCategoryRequest request) {
        return ApiResponse.success(categoryService.updateCategory(id, request));
    }
}
