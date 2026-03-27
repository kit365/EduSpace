package com.eduspace.roomservice.presentation.controller.internal;

import com.eduspace.roomservice.business.service.PropertyService;
import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.model.dto.response.RoomDashboardStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms/internal")
@RequiredArgsConstructor
public class InternalRoomController {

    private final RoomService roomService;
    private final PropertyService propertyService;

    @GetMapping("/stats")
    public ApiResponse<RoomDashboardStatsResponse> getStats() {
        return ApiResponse.success(roomService.getDashboardStats());
    }

    @GetMapping("/properties/pending")
    public ApiResponse<List<PropertyResponse>> getPendingProperties() {
        return ApiResponse.success(propertyService.getPendingSortedBySubmittedAtDesc());
    }
}
