package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.common.enums.banks.VietnamBankEnum;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.banks.BankOptionResponse;
import com.eduspace.accountservice.presentation.constants.BankPaths;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(BankPaths.BANKS)
@RequiredArgsConstructor
public class BankController {

    @GetMapping
    public ApiResponse<List<BankOptionResponse>> getAll() {
        List<BankOptionResponse> list = VietnamBankEnum.valuesList().stream()
                .map(b -> new BankOptionResponse(b.getBankCode(), b.getBankName()))
                .toList();
        return ApiResponse.success(list);
    }
}
