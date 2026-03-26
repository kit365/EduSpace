package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.banks.SetDefaultBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.UpsertBankInformationRequest;
import com.eduspace.accountservice.model.dto.request.banks.VerifyBankInformationRequest;
import com.eduspace.accountservice.model.dto.response.banks.BankInformationResponse;
import java.util.List;

public interface BankInformationService {

    List<BankInformationResponse> getMyBanks();

    BankInformationResponse createMyBank(UpsertBankInformationRequest request);

    BankInformationResponse updateMyBank(Long id, UpsertBankInformationRequest request);

    BankInformationResponse setMyDefault(Long bankInfoId, SetDefaultBankInformationRequest request);

    BankInformationResponse verifyBank(Long bankInfoId, VerifyBankInformationRequest request);

    BankInformationResponse createGuestBankForBookingCode(String bookingCode, UpsertBankInformationRequest request);

    BankInformationResponse createGuestBankForOrderCode(String orderCode, UpsertBankInformationRequest request);

    BankInformationResponse getBankForBookingCode(String bookingCode);

    BankInformationResponse getBankByGuestEmail(String email);

    BankInformationResponse getBankForOrderId(String orderId);

    List<BankInformationResponse> getAllForVerify(Boolean verifiedOnly);
}
