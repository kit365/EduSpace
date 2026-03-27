package com.eduspace.bookingservice.presentation.controller;

import com.eduspace.bookingservice.business.service.UserVoucherService;
import com.eduspace.bookingservice.model.dto.response.ApiResponse;
import com.eduspace.bookingservice.model.dto.response.UserVoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherUsageResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User-facing voucher wallet & admin usage history.
 * Endpoints: /api/v1/user-vouchers
 */
@RestController
@RequestMapping("/api/v1/user-vouchers")
@RequiredArgsConstructor
public class UserVoucherController {

    private final UserVoucherService userVoucherService;

    /**
     * User claim (lấy) voucher vào ví.
     * POST /api/v1/user-vouchers/claim?userId=xxx&voucherCode=SUMMER20
     */
    @PostMapping("/claim")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserVoucherResponse> claimVoucher(
            @RequestParam @NotBlank String userId,
            @RequestParam @NotBlank String voucherCode) {
        return ApiResponse.success(userVoucherService.claimVoucher(userId, voucherCode));
    }

    /**
     * Lấy danh sách voucher trong ví của user.
     * GET /api/v1/user-vouchers?userId=xxx
     */
    @GetMapping
    public ApiResponse<List<UserVoucherResponse>> getMyVouchers(
            @RequestParam @NotBlank String userId) {
        return ApiResponse.success(userVoucherService.getMyVouchers(userId));
    }

    /**
     * Lịch sử dùng voucher của user.
     * GET /api/v1/user-vouchers/history?userId=xxx
     */
    @GetMapping("/history")
    public ApiResponse<List<VoucherUsageResponse>> getMyHistory(
            @RequestParam @NotBlank String userId) {
        return ApiResponse.success(userVoucherService.getMyUsageHistory(userId));
    }

    /**
     * Admin: lịch sử dùng theo voucherId.
     * GET /api/v1/user-vouchers/usage-by-voucher/{voucherId}
     */
    @GetMapping("/usage-by-voucher/{voucherId}")
    public ApiResponse<List<VoucherUsageResponse>> getUsageByVoucher(
            @PathVariable Long voucherId) {
        return ApiResponse.success(userVoucherService.getUsageByVoucher(voucherId));
    }
}
