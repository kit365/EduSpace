package com.eduspace.bookingservice.service;

import com.eduspace.bookingservice.domain.entity.BookingDepositRefundPolicy;
import com.eduspace.bookingservice.persistence.BookingDepositRefundPolicyRepository;
import com.eduspace.bookingservice.web.dto.BookingDepositRefundPolicyResponse;
import com.eduspace.bookingservice.web.dto.UpsertBookingDepositRefundPolicyRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingDepositRefundPolicyService {

    private final BookingDepositRefundPolicyRepository repository;

    @Transactional(readOnly = true)
    public List<BookingDepositRefundPolicyResponse> findAll() {
        return repository.findAllNotDeletedOrderByDisplayOrder().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingDepositRefundPolicyResponse create(UpsertBookingDepositRefundPolicyRequest req) {
        if (Boolean.TRUE.equals(req.isDefault())) {
            repository.findAllActiveNotDeleted().forEach(p -> {
                if (Boolean.TRUE.equals(p.getIsDefault())) {
                    p.setIsDefault(false);
                    repository.save(p);
                }
            });
        }
        BookingDepositRefundPolicy p = mapNew(req);
        return toResponse(repository.save(p));
    }

    @Transactional
    public BookingDepositRefundPolicyResponse update(Long id, UpsertBookingDepositRefundPolicyRequest req) {
        BookingDepositRefundPolicy p = repository.findById(id)
                .filter(x -> !x.isDeleted())
                .orElseThrow(() -> new EntityNotFoundException("Policy not found: " + id));
        if (Boolean.TRUE.equals(req.isDefault())) {
            repository.findAllActiveNotDeleted().stream()
                    .filter(x -> !x.getId().equals(id))
                    .forEach(x -> {
                        if (Boolean.TRUE.equals(x.getIsDefault())) {
                            x.setIsDefault(false);
                            repository.save(x);
                        }
                    });
        }
        apply(p, req);
        return toResponse(repository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        BookingDepositRefundPolicy p = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Policy not found: " + id));
        p.setDeleted(true);
        repository.save(p);
    }

    private BookingDepositRefundPolicy mapNew(UpsertBookingDepositRefundPolicyRequest req) {
        return BookingDepositRefundPolicy.builder()
                .policyName(req.policyName())
                .description(req.description())
                .depositPercentage(req.depositPercentage())
                .fullRefundHours(req.fullRefundHours())
                .fullRefundPercentage(req.fullRefundPercentage())
                .partialRefundHours(req.partialRefundHours())
                .partialRefundPercentage(req.partialRefundPercentage())
                .noRefundHours(req.noRefundHours())
                .noRefundPercentage(req.noRefundPercentage())
                .noShowRefundPercentage(req.noShowRefundPercentage())
                .noShowPenalty(req.noShowPenalty())
                .allowForceMajeure(req.allowForceMajeure())
                .forceMajeureRefundPercentage(req.forceMajeureRefundPercentage())
                .forceMajeureRequiresEvidence(req.forceMajeureRequiresEvidence())
                .isDefault(req.isDefault())
                .displayOrder(req.displayOrder() != null ? req.displayOrder() : 0)
                .highlightText(req.highlightText())
                .active(req.isActive())
                .deleted(false)
                .build();
    }

    private void apply(BookingDepositRefundPolicy p, UpsertBookingDepositRefundPolicyRequest req) {
        p.setPolicyName(req.policyName());
        p.setDescription(req.description());
        p.setDepositPercentage(req.depositPercentage());
        p.setFullRefundHours(req.fullRefundHours());
        p.setFullRefundPercentage(req.fullRefundPercentage());
        p.setPartialRefundHours(req.partialRefundHours());
        p.setPartialRefundPercentage(req.partialRefundPercentage());
        p.setNoRefundHours(req.noRefundHours());
        p.setNoRefundPercentage(req.noRefundPercentage());
        p.setNoShowRefundPercentage(req.noShowRefundPercentage());
        p.setNoShowPenalty(req.noShowPenalty());
        p.setAllowForceMajeure(req.allowForceMajeure());
        p.setForceMajeureRefundPercentage(req.forceMajeureRefundPercentage());
        p.setForceMajeureRequiresEvidence(req.forceMajeureRequiresEvidence());
        p.setIsDefault(req.isDefault());
        p.setDisplayOrder(req.displayOrder() != null ? req.displayOrder() : 0);
        p.setHighlightText(req.highlightText());
        p.setActive(req.isActive());
    }

    private BookingDepositRefundPolicyResponse toResponse(BookingDepositRefundPolicy p) {
        return new BookingDepositRefundPolicyResponse(
                p.getId(),
                p.getPolicyName(),
                p.getDescription(),
                p.getDepositPercentage(),
                p.getFullRefundHours(),
                p.getFullRefundPercentage(),
                p.getPartialRefundHours(),
                p.getPartialRefundPercentage(),
                p.getNoRefundHours(),
                p.getNoRefundPercentage(),
                p.getNoShowRefundPercentage(),
                p.getNoShowPenalty(),
                p.getAllowForceMajeure(),
                p.getForceMajeureRefundPercentage(),
                p.getForceMajeureRequiresEvidence(),
                p.getIsDefault(),
                p.getDisplayOrder(),
                p.getHighlightText(),
                p.isActive(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
