package com.eduspace.roomservice.presentation.controller.unauthenticated;

import com.eduspace.roomservice.business.service.RoomCategoryService;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomCategoryResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.RoomCategories.PUBLIC_PATH)
@RequiredArgsConstructor
public class PublicRoomCategoryController {

    private final RoomCategoryService categoryService;

    @GetMapping("/featured")
    public ApiResponse<List<RoomCategoryResponse>> getFeatured() {
        return ApiResponse.success(categoryService.getFeaturedCategories());
    }
}
