package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.BookingDepositRefundPolicyService;
import com.eduspace.bookingservice.common.enums.BookingPolicyType;
import com.eduspace.bookingservice.model.dto.request.UpsertBookingDepositRefundPolicyRequest;
import com.eduspace.bookingservice.model.dto.response.BookingDepositRefundPolicyResponse;
import com.eduspace.bookingservice.model.entity.BookingDepositRefundPolicyEntity;
import com.eduspace.bookingservice.persistence.repository.BookingDepositRefundPolicyRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingDepositRefundPolicyServiceImpl implements BookingDepositRefundPolicyService {

    private final BookingDepositRefundPolicyRepository policyRepository;

    @Override
    public List<BookingDepositRefundPolicyResponse> findAllActivePublic() {
        return policyRepository.findAllByDeletedFalseAndActiveTrueOrderByIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BookingDepositRefundPolicyResponse> findAll() {
        return policyRepository.findAllByDeletedFalseOrderByIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingDepositRefundPolicyResponse create(UpsertBookingDepositRefundPolicyRequest request) {
        BookingDepositRefundPolicyEntity entity = new BookingDepositRefundPolicyEntity();
        applyUpsert(entity, request);
        if (Boolean.TRUE.equals(request.getDefaultPolicy())) {
            clearOtherDefaults(request.getPolicyType(), null);
            entity.setActive(true);
        }
        return toResponse(policyRepository.save(entity));
    }

    @Override
    @Transactional
    public BookingDepositRefundPolicyResponse update(Long id, UpsertBookingDepositRefundPolicyRequest request) {
        BookingDepositRefundPolicyEntity entity = policyRepository
                .findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chính sách với id: " + id));
        applyUpsert(entity, request);
        if (Boolean.TRUE.equals(request.getDefaultPolicy())) {
            clearOtherDefaults(request.getPolicyType(), id);
            entity.setActive(true);
        }
        return toResponse(policyRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BookingDepositRefundPolicyEntity entity = policyRepository
                .findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chính sách với id: " + id));
        entity.setDeleted(true);
        entity.setActive(false);
        policyRepository.save(entity);
    }

    private void clearOtherDefaults(BookingPolicyType policyType, Long excludeId) {
        policyRepository.findAllByDeletedFalseOrderByIdAsc().forEach(p -> {
            if (p.getPolicyType() == policyType
                    && Boolean.TRUE.equals(p.getIsDefault())
                    && (excludeId == null || !p.getId().equals(excludeId))) {
                p.setIsDefault(false);
            }
        });
    }

    private void applyUpsert(BookingDepositRefundPolicyEntity entity, UpsertBookingDepositRefundPolicyRequest r) {
        if (r.getStartHour() != null && r.getEndHour() != null && r.getStartHour() > r.getEndHour()) {
            throw new IllegalArgumentException("startHour không được lớn hơn endHour");
        }
        if (r.getPolicyType() == BookingPolicyType.REFUND) {
            if (r.getFullRefundHours() == null
                    || r.getFullRefundPercentage() == null
                    || r.getPartialRefundHours() == null
                    || r.getPartialRefundPercentage() == null
                    || r.getNoRefundHours() == null
                    || r.getNoRefundPercentage() == null) {
                throw new IllegalArgumentException("REFUND policy cần đầy đủ các mốc hoàn tiền");
            }
        }

        entity.setPolicyName(r.getPolicyName().trim());
        entity.setDescription(r.getDescription());
        entity.setPolicyType(r.getPolicyType());
        entity.setDepositPercentage(r.getDepositPercentage());
        entity.setStartHour(r.getStartHour());
        entity.setEndHour(r.getEndHour());
        entity.setFullRefundHours(r.getFullRefundHours() != null ? r.getFullRefundHours() : 0);
        entity.setFullRefundPercentage(zeroIfNull(r.getFullRefundPercentage()));
        entity.setPartialRefundHours(r.getPartialRefundHours() != null ? r.getPartialRefundHours() : 0);
        entity.setPartialRefundPercentage(zeroIfNull(r.getPartialRefundPercentage()));
        entity.setNoRefundHours(r.getNoRefundHours() != null ? r.getNoRefundHours() : 0);
        entity.setNoRefundPercentage(zeroIfNull(r.getNoRefundPercentage()));
        entity.setIsDefault(r.getDefaultPolicy());
        entity.setHighlightText(r.getHighlightText());
        entity.setActive(r.getActive());
    }

    private static BigDecimal zeroIfNull(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private BookingDepositRefundPolicyResponse toResponse(BookingDepositRefundPolicyEntity p) {
        return new BookingDepositRefundPolicyResponse(
                p.getId(),
                p.getPolicyName(),
                p.getDescription(),
                p.getPolicyType(),
                p.getDepositPercentage(),
                p.getStartHour(),
                p.getEndHour(),
                p.getFullRefundHours(),
                p.getFullRefundPercentage(),
                p.getPartialRefundHours(),
                p.getPartialRefundPercentage(),
                p.getNoRefundHours(),
                p.getNoRefundPercentage(),
                p.getIsDefault(),
                p.getHighlightText(),
                p.getActive());
    }
}
