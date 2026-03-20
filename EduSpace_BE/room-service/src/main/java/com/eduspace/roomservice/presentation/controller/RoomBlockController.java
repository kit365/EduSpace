package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomBlockService;
import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.RoomBlocks.BASE_PATH)
@RequiredArgsConstructor
public class RoomBlockController {

    private final RoomBlockService roomBlockService;

    @GetMapping
    public ApiResponse<List<RoomBlockResponse>> getAll(@RequestParam(required = false) Integer roomId) {
        if (roomId != null) {
            return ApiResponse.success(roomBlockService.getByRoomId(roomId));
        }
        return ApiResponse.success(roomBlockService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomBlockResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(roomBlockService.getById(id));
    }

    @PostMapping
    public ApiResponse<RoomBlockResponse> create(@RequestBody RoomBlockRequest request) {
        return ApiResponse.success(roomBlockService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomBlockResponse> update(@PathVariable Integer id, @RequestBody RoomBlockRequest request) {
        return ApiResponse.success(roomBlockService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomBlockService.deleteById(id);
        return ApiResponse.success(null);
    }
}
