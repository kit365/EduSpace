package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.business.service.BankInformationService;
import com.eduspace.accountservice.model.dto.request.banks.SetDefaultBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.UpsertBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.VerifyBankInformationRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.banks.BankInformationResponse;
import com.eduspace.accountservice.presentation.constants.BankPaths;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(BankPaths.BANK_INFORMATION)
@RequiredArgsConstructor
public class BankInformationController {

    private final BankInformationService bankInformationService;

    @GetMapping("/me")
    public ApiResponse<List<BankInformationResponse>> getMyBanks() {
        return ApiResponse.success(bankInformationService.getMyBanks());
    }

    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BankInformationResponse> createMyBank(@Valid @RequestBody UpsertBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.createMyBank(request));
    }

    @PutMapping("/me/{id}")
    public ApiResponse<BankInformationResponse> updateMyBank(
            @PathVariable("id") Long id, @Valid @RequestBody UpsertBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.updateMyBank(id, request));
    }

    @PatchMapping("/me/{id}/default")
    public ApiResponse<BankInformationResponse> setMyDefault(
            @PathVariable("id") Long id, @Valid @RequestBody SetDefaultBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.setMyDefault(id, request));
    }

    @PostMapping("/booking/code/{bookingCode}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BankInformationResponse> createGuestBankForBooking(
            @PathVariable String bookingCode, @Valid @RequestBody UpsertBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.createGuestBankForBookingCode(bookingCode, request));
    }

    @PostMapping("/order/code/{orderCode}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BankInformationResponse> createGuestBankForOrder(
            @PathVariable String orderCode, @Valid @RequestBody UpsertBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.createGuestBankForOrderCode(orderCode, request));
    }

    @GetMapping("/booking/code/{bookingCode}")
    public ApiResponse<BankInformationResponse> getBankForBooking(@PathVariable String bookingCode) {
        return ApiResponse.success(bankInformationService.getBankForBookingCode(bookingCode));
    }

    @GetMapping("/guest-by-email")
    public ApiResponse<BankInformationResponse> getBankByGuestEmail(@RequestParam String email) {
        return ApiResponse.success(bankInformationService.getBankByGuestEmail(email));
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<BankInformationResponse> getBankForOrder(@PathVariable String orderId) {
        return ApiResponse.success(bankInformationService.getBankForOrderId(orderId));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<BankInformationResponse> verify(
            @PathVariable("id") Long id, @Valid @RequestBody VerifyBankInformationRequest request) {
        return ApiResponse.success(bankInformationService.verifyBank(id, request));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ApiResponse<List<BankInformationResponse>> getAllForVerify(
            @RequestParam(required = false) Boolean verified) {
        return ApiResponse.success(bankInformationService.getAllForVerify(verified));
    }
}
