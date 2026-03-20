package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomSlotService;
import com.eduspace.roomservice.model.dto.request.RoomSlotRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomSlotResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.RoomSlots.BASE_PATH)
@RequiredArgsConstructor
public class RoomSlotController {

    private final RoomSlotService roomSlotService;

    @GetMapping
    public ApiResponse<List<RoomSlotResponse>> getAll(@RequestParam(required = false) Integer roomId) {
        if (roomId != null) {
            return ApiResponse.success(roomSlotService.getByRoomId(roomId));
        }
        return ApiResponse.success(roomSlotService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomSlotResponse> getById(@PathVariable Integer id) {
        return ApiResponse.success(roomSlotService.getById(id));
    }

    @PostMapping
    public ApiResponse<RoomSlotResponse> create(@RequestBody RoomSlotRequest request) {
        return ApiResponse.success(roomSlotService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomSlotResponse> update(@PathVariable Integer id, @RequestBody RoomSlotRequest request) {
        return ApiResponse.success(roomSlotService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomSlotService.deleteById(id);
        return ApiResponse.success(null);
    }
}
