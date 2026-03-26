package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.VoucherService;
import com.eduspace.bookingservice.common.enums.DiscountType;
import com.eduspace.bookingservice.model.dto.request.CreateVoucherRequest;
import com.eduspace.bookingservice.model.dto.response.VoucherResponse;
import com.eduspace.bookingservice.model.dto.response.VoucherValidationResponse;
import com.eduspace.bookingservice.model.entity.VoucherEntity;
import com.eduspace.bookingservice.persistence.repository.UserVoucherRepository;
import com.eduspace.bookingservice.persistence.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;

    // ──────────────────────────────────────────
    // CRUD
    // ──────────────────────────────────────────

    @Override
    public VoucherResponse create(CreateVoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();

        if (voucherRepository.existsByCodeAndIsDeletedFalse(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Mã voucher đã tồn tại: " + code);
        }
        if (!request.getValidUntil().isAfter(request.getValidFrom())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "validUntil phải sau validFrom");
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "discountValue không được vượt quá 100% khi loại là PERCENTAGE");
        }

        VoucherEntity entity = new VoucherEntity();
        entity.setCampaignId(request.getCampaignId());
        entity.setCode(code);
        entity.setDiscountType(request.getDiscountType());
        entity.setDiscountValue(request.getDiscountValue());
        entity.setMinOrderValue(request.getMinOrderValue() != null
                ? request.getMinOrderValue() : BigDecimal.ZERO);
        entity.setMaxDiscountAmount(request.getMaxDiscountAmount());
        entity.setMaxUses(request.getMaxUses());
        entity.setMaxUsesPerUser(request.getMaxUsesPerUser() != null
                ? request.getMaxUsesPerUser() : 1);
        entity.setValidFrom(request.getValidFrom());
        entity.setValidUntil(request.getValidUntil());
        entity.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        entity.setIsDeleted(false);
        entity.setUsedCount(0);

        VoucherEntity saved = voucherRepository.save(entity);
        log.info("Created voucher id={} code={}", saved.getId(), saved.getCode());
        return toResponse(saved);
    }

    @Override
    public VoucherResponse update(Long id, CreateVoucherRequest request) {
        VoucherEntity entity = findOrThrow(id);
        
        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : entity.getCode();
        
        if (!entity.getCode().equals(code) && voucherRepository.existsByCodeAndIsDeletedFalse(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Mã voucher đã tồn tại: " + code);
        }
        if (!request.getValidUntil().isAfter(request.getValidFrom())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "validUntil phải sau validFrom");
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "discountValue không được vượt quá 100% khi loại là PERCENTAGE");
        }

        entity.setCampaignId(request.getCampaignId());
        entity.setCode(code);
        entity.setDiscountType(request.getDiscountType());
        entity.setDiscountValue(request.getDiscountValue());
        entity.setMinOrderValue(request.getMinOrderValue() != null
                ? request.getMinOrderValue() : BigDecimal.ZERO);
        entity.setMaxDiscountAmount(request.getMaxDiscountAmount());
        entity.setMaxUses(request.getMaxUses());
        entity.setMaxUsesPerUser(request.getMaxUsesPerUser() != null
                ? request.getMaxUsesPerUser() : 1);
        entity.setValidFrom(request.getValidFrom());
        entity.setValidUntil(request.getValidUntil());
        entity.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        VoucherEntity saved = voucherRepository.save(entity);
        log.info("Updated voucher id={} code={}", saved.getId(), saved.getCode());
        return toResponse(saved);
    }

    @Override
    public VoucherResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public VoucherResponse getByCode(String code) {
        VoucherEntity entity = voucherRepository
                .findByCodeAndIsDeletedFalse(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Voucher không tồn tại: " + code));
        return toResponse(entity);
    }

    @Override
    public List<VoucherResponse> getAll(Long campaignId) {
        return voucherRepository.findAllByCampaign(campaignId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<VoucherResponse> getAllPublicAndValid() {
        return voucherRepository.findAllPublicAndValid(LocalDateTime.now())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public VoucherResponse toggleActive(Long id) {
        VoucherEntity entity = findOrThrow(id);
        entity.setIsActive(!entity.getIsActive());
        return toResponse(voucherRepository.save(entity));
    }

    @Override
    public void softDelete(Long id) {
        VoucherEntity entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setIsActive(false);
        voucherRepository.save(entity);
        log.info("Soft-deleted voucher id={} code={}", id, entity.getCode());
    }

    // ──────────────────────────────────────────
    // Validate (Preview — không ghi DB)
    // ──────────────────────────────────────────

    @Override
    public VoucherValidationResponse validate(String code, String userId, BigDecimal orderAmount) {
        VoucherEntity voucher = voucherRepository
                .findByCodeAndIsDeletedFalse(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Voucher không tồn tại: " + code));

        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra còn hoạt động
        if (!voucher.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã bị vô hiệu hóa");
        }
        // 2. Kiểm tra thời hạn
        if (now.isBefore(voucher.getValidFrom())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher chưa đến thời gian áp dụng");
        }
        if (now.isAfter(voucher.getValidUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã hết hạn");
        }
        // 3. Kiểm tra tổng lượt dùng
        if (voucher.getMaxUses() != null && voucher.getUsedCount() >= voucher.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher đã hết lượt sử dụng");
        }
        // 4. Kiểm tra giá trị đơn hàng tối thiểu
        if (orderAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giá trị đơn hàng tối thiểu để dùng voucher này là "
                            + voucher.getMinOrderValue() + " VND");
        }
        // 5. Kiểm tra số lần user đã dùng voucher này
        long userUsedCount = userVoucherRepository
                .countByUserIdAndVoucherIdAndIsUsedTrue(userId, voucher.getId());
        if (userUsedCount >= voucher.getMaxUsesPerUser()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bạn đã sử dụng hết lượt dùng voucher này");
        }

        // 6. Tính toán giảm giá
        BigDecimal discount = calculateDiscount(voucher, orderAmount);
        BigDecimal finalPrice = orderAmount.subtract(discount).max(BigDecimal.ZERO);

        return VoucherValidationResponse.builder()
                .voucherCode(voucher.getCode())
                .originalPrice(orderAmount)
                .discountAmount(discount)
                .finalPrice(finalPrice)
                .message("Áp dụng voucher thành công! Bạn được giảm "
                        + discount.setScale(0, RoundingMode.HALF_UP) + " VND")
                .build();
    }

    // ──────────────────────────────────────────
    // Package-private helper (dùng bởi UserVoucherServiceImpl)
    // ──────────────────────────────────────────

    /**
     * Tính số tiền giảm giá theo rule của voucher.
     */
    public BigDecimal calculateDiscount(VoucherEntity voucher, BigDecimal orderAmount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Áp trần maxDiscountAmount nếu có
            if (voucher.getMaxDiscountAmount() != null
                    && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            // FIXED_AMOUNT — không giảm quá giá trị đơn hàng
            discount = voucher.getDiscountValue().min(orderAmount);
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────

    public VoucherEntity findByCodeOrThrow(String code) {
        return voucherRepository
                .findByCodeAndIsDeletedFalse(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Voucher không tồn tại: " + code));
    }

    private VoucherEntity findOrThrow(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Voucher không tồn tại: " + id));
    }

    private VoucherResponse toResponse(VoucherEntity e) {
        return VoucherResponse.builder()
                .id(e.getId())
                .campaignId(e.getCampaignId())
                .code(e.getCode())
                .discountType(e.getDiscountType())
                .discountValue(e.getDiscountValue())
                .minOrderValue(e.getMinOrderValue())
                .maxDiscountAmount(e.getMaxDiscountAmount())
                .maxUses(e.getMaxUses())
                .usedCount(e.getUsedCount())
                .maxUsesPerUser(e.getMaxUsesPerUser())
                .validFrom(e.getValidFrom())
                .validUntil(e.getValidUntil())
                .isPublic(e.getIsPublic())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
