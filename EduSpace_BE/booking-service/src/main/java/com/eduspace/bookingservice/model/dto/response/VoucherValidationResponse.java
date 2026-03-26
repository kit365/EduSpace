package com.eduspace.bookingservice.model.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Kết quả tính giảm giá khi validate voucher (trước khi book).
 * Không commit vào DB — chỉ trả về cho FE xem trước.
 */
@Getter
@Builder
public class VoucherValidationResponse {
    private String voucherCode;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String message;
}
