package com.eduspace.bookingservice.web;

import com.eduspace.bookingservice.service.BookingRefundAdminService;
import com.eduspace.bookingservice.web.dto.AdminHandleBookingRefundRequest;
import com.eduspace.bookingservice.web.dto.ApiResponse;
import com.eduspace.bookingservice.web.dto.BookingRefundResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/booking-refunds")
@RequiredArgsConstructor
@Tag(name = "Admin booking refunds", description = "Xử lý yêu cầu hoàn tiền")
public class AdminBookingRefundController {

    private final BookingRefundAdminService bookingRefundAdminService;

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','STAFF')")
    @Operation(summary = "Danh sách refund theo booking")
    public ResponseEntity<ApiResponse<List<BookingRefundResponse>>> byBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingRefundAdminService.listByBooking(bookingId)));
    }

    @PutMapping("/{refundId}/handle")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','STAFF')")
    @Operation(summary = "Phê duyệt / từ chối hoàn tiền")
    public ResponseEntity<ApiResponse<BookingRefundResponse>> handle(
            @PathVariable Long refundId,
            @Valid @RequestBody AdminHandleBookingRefundRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.ok(bookingRefundAdminService.handle(refundId, request, jwt)));
    }
}
