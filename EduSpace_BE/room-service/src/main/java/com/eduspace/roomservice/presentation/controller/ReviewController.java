package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.ReviewService;
import com.eduspace.roomservice.model.dto.request.ReviewRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.ReviewResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Reviews.BASE_PATH)
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ApiResponse<List<ReviewResponse>> getAll(@RequestParam(required = false) Integer roomId) {
        if (roomId != null) {
            return ApiResponse.success(reviewService.getByRoomId(roomId));
        }
        return ApiResponse.success(reviewService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<ReviewResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(reviewService.getById(id));
    }

    @PostMapping
    public ApiResponse<ReviewResponse> create(@RequestBody ReviewRequest request) {
        return ApiResponse.success(reviewService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> update(@PathVariable Integer id, @RequestBody ReviewRequest request) {
        return ApiResponse.success(reviewService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        reviewService.deleteById(id);
        return ApiResponse.success(null);
    }
}
