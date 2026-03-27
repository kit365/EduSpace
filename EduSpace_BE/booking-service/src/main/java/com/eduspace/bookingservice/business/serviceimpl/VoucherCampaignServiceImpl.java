package com.eduspace.bookingservice.business.serviceimpl;

import com.eduspace.bookingservice.business.service.VoucherCampaignService;
import com.eduspace.bookingservice.model.dto.request.CreateVoucherCampaignRequest;
import com.eduspace.bookingservice.model.dto.response.VoucherCampaignResponse;
import com.eduspace.bookingservice.model.entity.VoucherCampaignEntity;
import com.eduspace.bookingservice.persistence.repository.VoucherCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherCampaignServiceImpl implements VoucherCampaignService {

    private final VoucherCampaignRepository campaignRepository;

    @Override
    public VoucherCampaignResponse create(CreateVoucherCampaignRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "endDate phải sau startDate");
        }
        VoucherCampaignEntity entity = new VoucherCampaignEntity();
        entity.setName(request.getName().trim());
        entity.setDescription(request.getDescription());
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        VoucherCampaignEntity saved = campaignRepository.save(entity);
        log.info("Created voucher campaign id={} name={}", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    @Override
    public VoucherCampaignResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public List<VoucherCampaignResponse> getAll() {
        return campaignRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<VoucherCampaignResponse> getAllActive() {
        return campaignRepository.findAllByIsActiveTrueOrderByStartDateDesc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public VoucherCampaignResponse toggleActive(Long id) {
        VoucherCampaignEntity entity = findOrThrow(id);
        entity.setIsActive(!entity.getIsActive());
        return toResponse(campaignRepository.save(entity));
    }

    @Override
    public void delete(Long id) {
        VoucherCampaignEntity entity = findOrThrow(id);
        campaignRepository.delete(entity);
        log.info("Deleted voucher campaign id={}", id);
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────

    private VoucherCampaignEntity findOrThrow(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Campaign không tồn tại: " + id));
    }

    private VoucherCampaignResponse toResponse(VoucherCampaignEntity e) {
        return VoucherCampaignResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
