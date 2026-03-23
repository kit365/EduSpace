package com.eduspace.roomservice.presentation.controller.unauthenticated;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.model.dto.request.RoomSearchRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.PageResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.Rooms.PUBLIC_PATH)
@RequiredArgsConstructor
public class PublicRoomController {

    private final RoomService roomService;

    @GetMapping
    public ApiResponse<PageResponse<RoomResponse>> getAll(
            @RequestParam(required = false) Integer propertyId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Integer> amenityIds,
            @RequestParam(required = false) String districtCode,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        // If propertyId is provided, we prioritize it (legacy behavior)
        if (propertyId != null) {
            List<RoomResponse> rooms = roomService.getRoomsByPropertyId(propertyId);
            return ApiResponse.success(PageResponse.<RoomResponse>builder()
                    .content(rooms)
                    .page(1)
                    .size(rooms.size())
                    .totalElements(rooms.size())
                    .totalPages(1)
                    .last(true)
                    .build());
        }

        RoomSearchRequest request = RoomSearchRequest.builder()
                .categorySlug(category)
                .keyword(keyword)
                .minCapacity(minCapacity)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .amenityIds(amenityIds)
                .districtCode(districtCode)
                .page(page)
                .size(size)
                .build();

        return ApiResponse.success(roomService.searchRooms(request));
    }

    @GetMapping("/{ref}")
    public ApiResponse<RoomResponse> getByRef(@PathVariable String ref) {
        if (ref != null && ref.matches("^\\d+$")) {
            return ApiResponse.success(roomService.getRoomById(Integer.parseInt(ref)));
        }
        return ApiResponse.success(roomService.getRoomBySlug(ref));
    }
}
