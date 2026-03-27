package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.CreateVoucherRequest;
import com.eduspace.bookingservice.model.dto.response.VoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherValidationResponse;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {

    VoucherResponse create(CreateVoucherRequest request);

    VoucherResponse update(Long id, CreateVoucherRequest request);

    VoucherResponse getById(Long id);

    VoucherResponse getByCode(String code);

    List<VoucherResponse> getAll(Long campaignId);

    List<VoucherResponse> getAllPublicAndValid();

    VoucherResponse toggleActive(Long id);

    void softDelete(Long id);

    /**
     * Kiểm tra voucher hợp lệ với user + giá tiền, trả về kết quả tính toán.
     * KHÔNG ghi DB — chỉ dùng để preview trước khi book.
     */
    VoucherValidationResponse validate(String code, String userId, BigDecimal orderAmount);
}
