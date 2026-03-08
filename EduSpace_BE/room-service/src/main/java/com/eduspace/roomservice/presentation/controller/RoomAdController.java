package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomAdService;
import com.eduspace.roomservice.model.dto.request.RoomAdRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomAdResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.RoomAds.BASE_PATH)
@RequiredArgsConstructor
public class RoomAdController {

    private final RoomAdService roomAdService;

    @GetMapping
    public ApiResponse<List<RoomAdResponse>> getAll(@RequestParam(required = false) Integer roomId) {
        if (roomId != null) {
            return ApiResponse.success(roomAdService.getByRoomId(roomId));
        }
        return ApiResponse.success(roomAdService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomAdResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(roomAdService.getById(id));
    }

    @PostMapping
    public ApiResponse<RoomAdResponse> create(@RequestBody RoomAdRequest request) {
        return ApiResponse.success(roomAdService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomAdResponse> update(@PathVariable Integer id, @RequestBody RoomAdRequest request) {
        return ApiResponse.success(roomAdService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomAdService.deleteById(id);
        return ApiResponse.success(null);
    }
}
