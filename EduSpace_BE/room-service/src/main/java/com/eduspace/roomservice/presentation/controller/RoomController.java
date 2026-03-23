package com.eduspace.roomservice.presentation.controller;

import com.eduspace.roomservice.business.service.RoomService;
import com.eduspace.roomservice.business.service.RoomScheduleService;
import com.eduspace.roomservice.business.service.RoomTimeslotService;
import com.eduspace.roomservice.model.dto.request.RoomAvailabilityCheckRequest;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.request.RoomScheduleItemRequest;
import com.eduspace.roomservice.model.dto.request.RoomStatusPatchRequest;
import com.eduspace.roomservice.model.dto.request.RoomPricingQuoteRequest;
import com.eduspace.roomservice.model.dto.request.RoomTimeslotItemRequest;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.model.dto.response.RoomAvailabilityCheckResponse;
import com.eduspace.roomservice.model.dto.response.RoomPricingQuoteResponse;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.dto.response.RoomTimeslotResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.Rooms.BASE_PATH)
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomScheduleService roomScheduleService;
    private final RoomTimeslotService roomTimeslotService;

    @GetMapping
    public ApiResponse<List<RoomResponse>> getAll(
            @RequestParam(required = false) Integer propertyId,
            @RequestParam(required = false) String ownerId) {
        if (propertyId != null) {
            return ApiResponse.success(roomService.getRoomsByPropertyId(propertyId));
        }
        if (ownerId != null && !ownerId.isBlank()) {
            return ApiResponse.success(roomService.getRoomsByOwnerId(ownerId.trim()));
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

    /** Host gửi chỉnh sửa chờ duyệt — cần ownerId (UUID) khớp property. */
    @PostMapping("/{id}/pending-edit")
    public ApiResponse<RoomResponse> submitPendingEdit(
            @PathVariable Integer id,
            @RequestBody RoomRequest request,
            @RequestParam String ownerId) {
        return ApiResponse.success(roomService.submitPendingEdit(id, request, ownerId));
    }

    @PostMapping("/{id}/pending-edit/approve")
    public ApiResponse<RoomResponse> approvePendingEdit(@PathVariable Integer id) {
        return ApiResponse.success(roomService.approvePendingEdit(id));
    }

    @PostMapping("/{id}/pending-edit/reject")
    public ApiResponse<RoomResponse> rejectPendingEdit(
            @PathVariable Integer id, @RequestParam(required = false) String rejectionNote) {
        return ApiResponse.success(roomService.rejectPendingEdit(id, rejectionNote));
    }

    /** Host: chỉ đổi trạng thái vận hành (READY / IN_USE / …). */
    @PatchMapping("/{id}/status")
    public ApiResponse<RoomResponse> patchStatus(
            @PathVariable Integer id, @RequestBody RoomStatusPatchRequest body) {
        return ApiResponse.success(roomService.updateStatus(id, body.getStatus()));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomResponse> update(@PathVariable Integer id, @RequestBody RoomRequest request) {
        return ApiResponse.success(roomService.update(id, request));
    }

    /** Thay thế toàn bộ lịch 7 ngày (host — ownerId khớp property). */
    @PutMapping("/{id}/schedules")
    public ApiResponse<RoomResponse> replaceSchedules(
            @PathVariable Integer id,
            @RequestParam String ownerId,
            @RequestBody List<RoomScheduleItemRequest> body) {
        roomScheduleService.replaceSchedules(id, ownerId, body);
        return ApiResponse.success(roomService.getRoomById(id));
    }

    @GetMapping("/{id}/timeslots")
    public ApiResponse<List<RoomTimeslotResponse>> getTimeslots(
            @PathVariable Integer id,
            @RequestParam LocalDate bookingDate) {
        return ApiResponse.success(roomTimeslotService.listByRoomAndDate(id, bookingDate));
    }

    @PutMapping("/{id}/timeslots")
    public ApiResponse<RoomResponse> replaceTimeslots(
            @PathVariable Integer id,
            @RequestParam String ownerId,
            @RequestBody List<RoomTimeslotItemRequest> body) {
        roomTimeslotService.replaceTimeslots(id, ownerId, body);
        return ApiResponse.success(roomService.getRoomById(id));
    }

    @PostMapping("/{id}/availability/check")
    public ApiResponse<RoomAvailabilityCheckResponse> checkAvailability(
            @PathVariable Integer id,
            @RequestBody RoomAvailabilityCheckRequest request) {
        return ApiResponse.success(roomTimeslotService.checkAvailability(id, request));
    }

    @PostMapping("/{id}/pricing/quote")
    public ApiResponse<RoomPricingQuoteResponse> quote(
            @PathVariable Integer id,
            @RequestBody RoomPricingQuoteRequest request) {
        return ApiResponse.success(roomTimeslotService.quote(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomService.deleteById(id);
        return ApiResponse.success(null);
    }
}
