package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.UpsertBookingDepositRefundPolicyRequest;
import com.eduspace.bookingservice.model.dto.response.BookingDepositRefundPolicyResponse;
import java.util.List;

public interface BookingDepositRefundPolicyService {

    /**
     * Active, non-deleted policies for customer-facing screens (checkout, policy details).
     */
    List<BookingDepositRefundPolicyResponse> findAllActivePublic();

    List<BookingDepositRefundPolicyResponse> findAll();

    BookingDepositRefundPolicyResponse create(UpsertBookingDepositRefundPolicyRequest request);

    BookingDepositRefundPolicyResponse update(Long id, UpsertBookingDepositRefundPolicyRequest request);

    void delete(Long id);
}
