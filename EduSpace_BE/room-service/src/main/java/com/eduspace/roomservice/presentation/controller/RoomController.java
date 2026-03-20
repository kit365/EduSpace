package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Rooms.BASE_PATH)
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ApiResponse<List<RoomResponse>> getAll(@RequestParam(required = false) Integer propertyId) {
        if (propertyId != null) {
            return ApiResponse.success(roomService.getRoomsByPropertyId(propertyId));
        }
        return ApiResponse.success(roomService.getAllRooms());
    }

    /**
     * Một segment: toàn số → theo id; ngược lại → theo slug.
     */
    @GetMapping("/{ref}")
    public ApiResponse<RoomResponse> getByRef(@PathVariable String ref) {
        if (ref != null && ref.matches("^\\d+$")) {
            return ApiResponse.success(roomService.getRoomById(Integer.parseInt(ref)));
        }
        return ApiResponse.success(roomService.getRoomBySlug(ref));
    }

    @PostMapping
    public ApiResponse<RoomResponse> create(@RequestBody RoomRequest request) {
        return ApiResponse.success(roomService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomResponse> update(@PathVariable Integer id, @RequestBody RoomRequest request) {
        return ApiResponse.success(roomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomService.deleteById(id);
        return ApiResponse.success(null);
    }
}
