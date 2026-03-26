package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomCategoryRequest;
import com.eduspace.roomservice.model.dto.response.RoomCategoryResponse;
import java.util.List;

public interface RoomCategoryService {
    List<RoomCategoryResponse> getFeaturedCategories();
    List<RoomCategoryResponse> getAllCategories();
    RoomCategoryResponse updateCategory(Integer id, RoomCategoryRequest request);
}
