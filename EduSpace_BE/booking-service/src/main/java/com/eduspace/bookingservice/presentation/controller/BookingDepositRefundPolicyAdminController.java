package com.eduspace.bookingservice.presentation.controller;

import com.eduspace.bookingservice.business.service.BookingDepositRefundPolicyService;
import com.eduspace.bookingservice.model.dto.request.UpsertBookingDepositRefundPolicyRequest;
import com.eduspace.bookingservice.model.dto.response.ApiResponse;
import com.eduspace.bookingservice.model.dto.response.BookingDepositRefundPolicyResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/booking-deposit-refund-policies")
@RequiredArgsConstructor
public class BookingDepositRefundPolicyAdminController {

    private final BookingDepositRefundPolicyService policyService;

    @GetMapping
    public ApiResponse<List<BookingDepositRefundPolicyResponse>> list() {
        return ApiResponse.success(policyService.findAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookingDepositRefundPolicyResponse> create(@Valid @RequestBody UpsertBookingDepositRefundPolicyRequest request) {
        return ApiResponse.success(policyService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<BookingDepositRefundPolicyResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpsertBookingDepositRefundPolicyRequest request) {
        return ApiResponse.success(policyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        policyService.delete(id);
    }
}
