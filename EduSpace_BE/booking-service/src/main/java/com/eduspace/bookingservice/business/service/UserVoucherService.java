package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.response.UserVoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherUsageResponse;

import java.math.BigDecimal;
import java.util.List;

public interface UserVoucherService {

    /**
     * User tự claim (lấy) một voucher public về ví của mình.
     */
    UserVoucherResponse claimVoucher(String userId, String voucherCode);

    /**
     * Lấy toàn bộ voucher trong ví của user.
     */
    List<UserVoucherResponse> getMyVouchers(String userId);

    /**
     * Áp dụng voucher vào booking (ghi DB, tăng used_count).
     * Trả về chi tiết usage. Gọi từ BookingService sau khi booking được tạo thành công.
     */
    VoucherUsageResponse applyVoucher(String userId, String voucherCode, Long bookingId, BigDecimal originalPrice);

    /**
     * Lịch sử dùng voucher của user.
     */
    List<VoucherUsageResponse> getMyUsageHistory(String userId);

    /**
     * Admin: lịch sử dùng toàn bộ theo voucherId.
     */
    List<VoucherUsageResponse> getUsageByVoucher(Long voucherId);
}
