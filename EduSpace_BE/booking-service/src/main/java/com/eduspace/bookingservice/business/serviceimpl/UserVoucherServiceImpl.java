package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.UserVoucherService;
import com.eduspace.bookingservice.model.dto.response.UserVoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherUsageResponse;
import com.eduspace.bookingservice.model.entity.UserVoucherEntity;
import com.eduspace.bookingservice.model.entity.VoucherEntity;
import com.eduspace.bookingservice.model.entity.VoucherUsageEntity;
import com.eduspace.bookingservice.persistence.repository.UserVoucherRepository;
import com.eduspace.bookingservice.persistence.repository.VoucherRepository;
import com.eduspace.bookingservice.persistence.repository.VoucherUsageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserVoucherServiceImpl implements UserVoucherService {

    private final UserVoucherRepository userVoucherRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final VoucherServiceImpl voucherServiceImpl; // reuse logic

    // ──────────────────────────────────────────
    // Claim voucher
    // ──────────────────────────────────────────

    @Override
    @Transactional
    public UserVoucherResponse claimVoucher(String userId, String voucherCode) {
        VoucherEntity voucher = voucherServiceImpl.findByCodeOrThrow(voucherCode);

        // Chỉ claim được voucher public
        if (!voucher.getIsPublic()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Voucher này không thể tự claim");
        }
        // Đã hết hạn chưa
        if (LocalDateTime.now().isAfter(voucher.getValidUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã hết hạn");
        }
        // Hết lượt toàn hệ thống chưa
        if (voucher.getMaxUses() != null && voucher.getUsedCount() >= voucher.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã hết lượt sử dụng");
        }
        // Đã claim chưa
        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucher.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bạn đã lưu voucher này rồi");
        }

        UserVoucherEntity uv = new UserVoucherEntity();
        uv.setUserId(userId);
        uv.setVoucherId(voucher.getId());
        uv.setIsUsed(false);
        UserVoucherEntity saved = userVoucherRepository.save(uv);

        log.info("User {} claimed voucher {}", userId, voucher.getCode());
        return toUserVoucherResponse(saved, voucher.getCode());
    }

    // ──────────────────────────────────────────
    // Ví voucher của user
    // ──────────────────────────────────────────

    @Override
    public List<UserVoucherResponse> getMyVouchers(String userId) {
        return userVoucherRepository.findAllByUserIdOrderByClaimedAtDesc(userId)
                .stream()
                .map(uv -> {
                    String code = voucherRepository.findById(uv.getVoucherId())
                            .map(VoucherEntity::getCode)
                            .orElse("UNKNOWN");
                    return toUserVoucherResponse(uv, code);
                })
                .toList();
    }

    // ──────────────────────────────────────────
    // Apply voucher (ghi DB, tăng used_count)
    // ──────────────────────────────────────────

    @Override
    @Transactional
    public VoucherUsageResponse applyVoucher(String userId,
                                              String voucherCode,
                                              Long bookingId,
                                              BigDecimal originalPrice) {
        VoucherEntity voucher = voucherServiceImpl.findByCodeOrThrow(voucherCode);

        // Validate lại toàn bộ rule (phòng race condition)
        LocalDateTime now = LocalDateTime.now();
        if (!voucher.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã bị vô hiệu hóa");
        }
        if (now.isBefore(voucher.getValidFrom()) || now.isAfter(voucher.getValidUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher không còn trong thời gian áp dụng");
        }
        if (voucher.getMaxUses() != null && voucher.getUsedCount() >= voucher.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã hết lượt sử dụng");
        }
        if (originalPrice.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giá trị đơn hàng chưa đạt mức tối thiểu để dùng voucher này");
        }
        long userUsedCount = userVoucherRepository
                .countByUserIdAndVoucherIdAndIsUsedTrue(userId, voucher.getId());
        if (userUsedCount >= voucher.getMaxUsesPerUser()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bạn đã sử dụng hết lượt dùng voucher này");
        }
        if (voucherUsageRepository.existsByVoucherIdAndBookingId(voucher.getId(), bookingId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Voucher đã được áp dụng cho booking này rồi");
        }

        // Tính giảm giá
        BigDecimal discount = voucherServiceImpl.calculateDiscount(voucher, originalPrice);
        BigDecimal finalPrice = originalPrice.subtract(discount).max(BigDecimal.ZERO);

        // Ghi usage audit
        VoucherUsageEntity usage = new VoucherUsageEntity();
        usage.setVoucherId(voucher.getId());
        usage.setBookingId(bookingId);
        usage.setUserId(userId);
        usage.setOriginalPrice(originalPrice);
        usage.setDiscountAmount(discount);
        usage.setFinalPrice(finalPrice);
        VoucherUsageEntity savedUsage = voucherUsageRepository.save(usage);

        // Tăng used_count
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);

        // Đánh dấu user_voucher đã dùng (nếu có record claim)
        userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId())
                .ifPresent(uv -> {
                    uv.setIsUsed(true);
                    uv.setUsedAt(LocalDateTime.now());
                    userVoucherRepository.save(uv);
                });

        log.info("Applied voucher {} to booking {} — discount={}", voucher.getCode(), bookingId, discount);
        return toUsageResponse(savedUsage, voucher.getCode());
    }

    // ──────────────────────────────────────────
    // Lịch sử
    // ──────────────────────────────────────────

    @Override
    public List<VoucherUsageResponse> getMyUsageHistory(String userId) {
        return voucherUsageRepository.findAllByUserId(userId)
                .stream()
                .map(u -> {
                    String code = voucherRepository.findById(u.getVoucherId())
                            .map(VoucherEntity::getCode).orElse("UNKNOWN");
                    return toUsageResponse(u, code);
                })
                .toList();
    }

    @Override
    public List<VoucherUsageResponse> getUsageByVoucher(Long voucherId) {
        String code = voucherRepository.findById(voucherId)
                .map(VoucherEntity::getCode).orElse("UNKNOWN");
        return voucherUsageRepository.findAllByVoucherId(voucherId)
                .stream()
                .map(u -> toUsageResponse(u, code))
                .toList();
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────

    private UserVoucherResponse toUserVoucherResponse(UserVoucherEntity uv, String code) {
        return UserVoucherResponse.builder()
                .id(uv.getId())
                .userId(uv.getUserId())
                .voucherId(uv.getVoucherId())
                .voucherCode(code)
                .claimedAt(uv.getClaimedAt())
                .isUsed(uv.getIsUsed())
                .usedAt(uv.getUsedAt())
                .build();
    }

    private VoucherUsageResponse toUsageResponse(VoucherUsageEntity u, String code) {
        return VoucherUsageResponse.builder()
                .id(u.getId())
                .voucherId(u.getVoucherId())
                .voucherCode(code)
                .bookingId(u.getBookingId())
                .userId(u.getUserId())
                .originalPrice(u.getOriginalPrice())
                .discountAmount(u.getDiscountAmount())
                .finalPrice(u.getFinalPrice())
                .usedAt(u.getUsedAt())
                .build();
    }
}
