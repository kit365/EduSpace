package com.eduspace.bookingservice.business.service;

import com.eduspace.bookingservice.model.dto.request.UpsertBookingDepositRefundPolicyRequest;
import com.eduspace.bookingservice.model.dto.response.BookingDepositRefundPolicyResponse;
import java.util.List;

public interface BookingDepositRefundPolicyService {

    List<BookingDepositRefundPolicyResponse> findAll();

    BookingDepositRefundPolicyResponse create(UpsertBookingDepositRefundPolicyRequest request);

    BookingDepositRefundPolicyResponse update(Long id, UpsertBookingDepositRefundPolicyRequest request);

    void delete(Long id);
}
