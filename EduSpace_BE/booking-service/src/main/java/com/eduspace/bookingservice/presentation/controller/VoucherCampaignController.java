package com.eduspace.bookingservice.presentation.controller;

import com.eduspace.bookingservice.business.service.VoucherCampaignService;
import com.eduspace.bookingservice.model.dto.request.CreateVoucherCampaignRequest;
import com.eduspace.bookingservice.model.dto.response.ApiResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherCampaignResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only: quản lý chiến dịch voucher.
 * Endpoints: /api/v1/voucher-campaigns
 */
@RestController
@RequestMapping("/api/v1/voucher-campaigns")
@RequiredArgsConstructor
public class VoucherCampaignController {

    private final VoucherCampaignService campaignService;

    /** Tạo chiến dịch mới. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VoucherCampaignResponse> create(
            @Valid @RequestBody CreateVoucherCampaignRequest request) {
        return ApiResponse.success(campaignService.create(request));
    }

    /** Cập nhật chiến dịch. */
    @PutMapping("/{id}")
    public ApiResponse<VoucherCampaignResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateVoucherCampaignRequest request) {
        return ApiResponse.success(campaignService.update(id, request));
    }

    /** Lấy tất cả chiến dịch (admin). */
    @GetMapping
    public ApiResponse<List<VoucherCampaignResponse>> getAll() {
        return ApiResponse.success(campaignService.getAll());
    }

    /** Lấy các chiến dịch đang hoạt động. */
    @GetMapping("/active")
    public ApiResponse<List<VoucherCampaignResponse>> getAllActive() {
        return ApiResponse.success(campaignService.getAllActive());
    }

    /** Chi tiết một chiến dịch. */
    @GetMapping("/{id}")
    public ApiResponse<VoucherCampaignResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(campaignService.getById(id));
    }

    /** Bật/tắt chiến dịch. */
    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<VoucherCampaignResponse> toggleActive(@PathVariable Long id) {
        return ApiResponse.success(campaignService.toggleActive(id));
    }

    /** Xóa chiến dịch (hard delete — chỉ khi chưa có voucher nào liên kết). */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        campaignService.delete(id);
    }
}
