package com.eduspace.bookingservice.web;

import com.eduspace.bookingservice.service.BookingDepositService;
import com.eduspace.bookingservice.web.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings/deposit-intent")
@RequiredArgsConstructor
@Tag(name = "Booking deposits", description = "Giữ chỗ và thanh toán cọc PayOS")
public class BookingDepositController {

    private final BookingDepositService bookingDepositService;

    @PostMapping
    @Operation(summary = "Tạo deposit intent (giữ chỗ ~5 phút)")
    public ResponseEntity<ApiResponse<CreateDepositIntentResponse>> create(
            @Valid @RequestBody CreateDepositIntentRequest request) {
        CreateDepositIntentResponse data = bookingDepositService.createDepositIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã giữ chỗ. Vui lòng thanh toán cọc.", data));
    }

    @PostMapping("/{depositId}/payos")
    @Operation(summary = "Tạo link PayOS thanh toán cọc")
    public ResponseEntity<ApiResponse<CreateDepositPayosResponse>> payos(
            @PathVariable Long depositId,
            @RequestParam(required = false) String returnUrl) {
        CreateDepositPayosResponse data = bookingDepositService.createPayosCheckoutUrl(depositId, returnUrl);
        return ResponseEntity.ok(ApiResponse.ok("Đã tạo link PayOS", data));
    }

    @GetMapping("/{depositId}/status")
    @Operation(summary = "Trạng thái deposit (sau khi redirect từ PayOS)")
    public ResponseEntity<ApiResponse<DepositStatusResponse>> status(@PathVariable Long depositId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingDepositService.getDepositStatus(depositId)));
    }
}
