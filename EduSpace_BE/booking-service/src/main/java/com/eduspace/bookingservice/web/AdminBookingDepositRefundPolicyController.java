package com.eduspace.bookingservice.web;

import com.eduspace.bookingservice.service.BookingDepositRefundPolicyService;
import com.eduspace.bookingservice.web.dto.ApiResponse;
import com.eduspace.bookingservice.web.dto.BookingDepositRefundPolicyResponse;
import com.eduspace.bookingservice.web.dto.UpsertBookingDepositRefundPolicyRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/booking-deposit-refund-policies")
@RequiredArgsConstructor
@Tag(name = "Admin deposit refund policies", description = "CRUD chính sách hoàn cọc")
public class AdminBookingDepositRefundPolicyController {

    private final BookingDepositRefundPolicyService policyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','STAFF')")
    @Operation(summary = "Danh sách chính sách")
    public ResponseEntity<ApiResponse<List<BookingDepositRefundPolicyResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(policyService.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Tạo chính sách")
    public ResponseEntity<ApiResponse<BookingDepositRefundPolicyResponse>> create(
            @Valid @RequestBody UpsertBookingDepositRefundPolicyRequest request) {
        BookingDepositRefundPolicyResponse data = policyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Cập nhật chính sách")
    public ResponseEntity<ApiResponse<BookingDepositRefundPolicyResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpsertBookingDepositRefundPolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(policyService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Xóa mềm chính sách")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        policyService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
