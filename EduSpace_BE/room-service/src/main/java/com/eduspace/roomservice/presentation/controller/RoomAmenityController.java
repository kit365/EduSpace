package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomAmenityService;
import com.eduspace.roomservice.model.dto.request.RoomAmenityRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomAmenityResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.RoomAmenities.BASE_PATH)
@RequiredArgsConstructor
public class RoomAmenityController {

    private final RoomAmenityService roomAmenityService;

    @GetMapping
    public ApiResponse<List<RoomAmenityResponse>> getAll(
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) Integer amenityId) {
        if (roomId != null) {
            return ApiResponse.success(roomAmenityService.getByRoomId(roomId));
        }
        if (amenityId != null) {
            return ApiResponse.success(roomAmenityService.getByAmenityId(amenityId));
        }
        return ApiResponse.success(roomAmenityService.getAll());
    }

    @GetMapping("/{roomId}/{amenityId}")
    public ApiResponse<RoomAmenityResponse> getById(
            @PathVariable Integer roomId,
            @PathVariable Integer amenityId) {
        return ApiResponse.success(roomAmenityService.getById(roomId, amenityId));
    }

    @PostMapping
    public ApiResponse<RoomAmenityResponse> create(@RequestBody RoomAmenityRequest request) {
        return ApiResponse.success(roomAmenityService.create(request));
    }

    @PutMapping("/{roomId}/{amenityId}")
    public ApiResponse<RoomAmenityResponse> update(
            @PathVariable Integer roomId,
            @PathVariable Integer amenityId,
            @RequestBody RoomAmenityRequest request) {
        return ApiResponse.success(roomAmenityService.update(roomId, amenityId, request));
    }

    @DeleteMapping("/{roomId}/{amenityId}")
    public ApiResponse<Void> delete(
            @PathVariable Integer roomId,
            @PathVariable Integer amenityId) {
        roomAmenityService.deleteById(roomId, amenityId);
        return ApiResponse.success(null);
    }
}
