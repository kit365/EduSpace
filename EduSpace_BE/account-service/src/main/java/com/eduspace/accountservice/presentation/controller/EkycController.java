package com.eduspace.accountservice.presentation.controller;

import com.eduspace.accountservice.model.dto.request.ekyc.EkycCommitRequest;
import com.eduspace.accountservice.model.dto.response.ApiResponse;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import com.eduspace.accountservice.presentation.constants.AccountPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(AccountPaths.BASE_PATH)
@RequiredArgsConstructor
public class EkycController {

    private final EkycVerificationService ekycVerificationService;
    private final MessageSource messageSource;

    @PostMapping(value = AccountPaths.EKYC_VERIFY, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<EkycVerifyResponse> verify(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("front") MultipartFile front,
            @RequestPart(value = "back", required = false) MultipartFile back,
            @RequestPart("selfie") MultipartFile selfie) {
        String keycloakId = jwt.getSubject();
        EkycVerifyResponse data = ekycVerificationService.verify(keycloakId, front, back, selfie);
        String message = messageSource.getMessage(
                SuccessCode.EKYC_VERIFY_SUCCESS.getMessageKey(),
                null,
                SuccessCode.EKYC_VERIFY_SUCCESS.getMessageKey(),
                LocaleContextHolder.getLocale());
        return ApiResponse.success(data, SuccessCode.EKYC_VERIFY_SUCCESS, message);
    }

    @PostMapping(AccountPaths.EKYC_COMMIT)
    public ApiResponse<EkycVerifyResponse> commit(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody EkycCommitRequest request) {
        String keycloakId = jwt.getSubject();
        EkycVerifyResponse data = ekycVerificationService.commitFromClient(keycloakId, request);
        String message = messageSource.getMessage(
                SuccessCode.EKYC_VERIFY_SUCCESS.getMessageKey(),
                null,
                SuccessCode.EKYC_VERIFY_SUCCESS.getMessageKey(),
                LocaleContextHolder.getLocale());
        return ApiResponse.success(data, SuccessCode.EKYC_VERIFY_SUCCESS, message);
    }
}
