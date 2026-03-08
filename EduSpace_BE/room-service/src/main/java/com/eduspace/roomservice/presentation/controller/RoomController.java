package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.Rooms.BASE_PATH)
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ApiResponse<List<RoomEntity>> getRooms() {
        return ApiResponse.success(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomEntity> getRoom(@PathVariable("id") String id) {
        return ApiResponse.success(roomService.getRoomById(id));
    }
}

