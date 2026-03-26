package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.CreateVoucherCampaignRequest;
import com.eduspace.bookingservice.model.dto.response.VoucherCampaignResponse;

import java.util.List;

public interface VoucherCampaignService {

    VoucherCampaignResponse create(CreateVoucherCampaignRequest request);

    VoucherCampaignResponse getById(Long id);

    List<VoucherCampaignResponse> getAll();

    List<VoucherCampaignResponse> getAllActive();

    VoucherCampaignResponse toggleActive(Long id);

    void delete(Long id);
}
