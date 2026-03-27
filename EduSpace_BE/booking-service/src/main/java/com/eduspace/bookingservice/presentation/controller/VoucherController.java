package com.eduspace.bookingservice.presentation.controller;

import com.eduspace.bookingservice.business.service.VoucherService;
import com.eduspace.bookingservice.model.dto.request.CreateVoucherRequest;
import com.eduspace.bookingservice.model.dto.response.ApiResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherValidationResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Voucher management & validation.
 * Endpoints: /api/v1/vouchers
 */
@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    // ──────────────────────────────────────────
    // Admin: CRUD
    // ──────────────────────────────────────────

    /** Tạo voucher mới (admin). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VoucherResponse> create(@Valid @RequestBody CreateVoucherRequest request) {
        return ApiResponse.success(voucherService.create(request));
    }

    /**
     * Lấy tất cả vouchers (admin).
     * Query param campaignId (optional) để lọc theo chiến dịch.
     */
    @GetMapping
    public ApiResponse<List<VoucherResponse>> getAll(
            @RequestParam(required = false) Long campaignId) {
        return ApiResponse.success(voucherService.getAll(campaignId));
    }

    /** Chi tiết voucher theo ID (admin). */
    @GetMapping("/{id}")
    public ApiResponse<VoucherResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(voucherService.getById(id));
    }

    /** Bật/tắt voucher (admin). */
    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<VoucherResponse> toggleActive(@PathVariable Long id) {
        return ApiResponse.success(voucherService.toggleActive(id));
    }

    /** Soft delete voucher (admin). */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        voucherService.softDelete(id);
    }

    // ──────────────────────────────────────────
    // User: xem & validate
    // ──────────────────────────────────────────

    /** Lấy danh sách voucher public còn hiệu lực (user xem để chọn). */
    @GetMapping("/public")
    public ApiResponse<List<VoucherResponse>> getPublicVouchers() {
        return ApiResponse.success(voucherService.getAllPublicAndValid());
    }

    /** Xem chi tiết voucher theo code (user lookup). */
    @GetMapping("/code/{code}")
    public ApiResponse<VoucherResponse> getByCode(@PathVariable @NotBlank String code) {
        return ApiResponse.success(voucherService.getByCode(code));
    }

    /**
     * Validate và preview kết quả giảm giá — KHÔNG ghi DB.
     * Dùng trước khi user xác nhận đặt phòng.
     *
     * POST /api/v1/vouchers/validate?userId=xxx&orderAmount=500000
     * Body: { "voucherCode": "SUMMER20" }
     */
    @PostMapping("/validate")
    public ApiResponse<VoucherValidationResponse> validate(
            @RequestParam @NotBlank String userId,
            @RequestParam @NotNull BigDecimal orderAmount,
            @RequestBody @Valid ValidateRequestBody body) {
        return ApiResponse.success(voucherService.validate(body.voucherCode(), userId, orderAmount));
    }

    /** Inner record để nhận voucherCode trong body của validate endpoint. */
    public record ValidateRequestBody(@NotBlank String voucherCode) {}
}
