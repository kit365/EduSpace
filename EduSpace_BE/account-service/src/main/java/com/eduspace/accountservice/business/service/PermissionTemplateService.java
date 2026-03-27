package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.permission.PermissionTemplateRequest;
import com.eduspace.accountservice.model.dto.response.role.PermissionTemplateResponse;

import java.util.List;

public interface PermissionTemplateService {

    List<PermissionTemplateResponse> findAll();

    PermissionTemplateResponse findById(Long id);

    PermissionTemplateResponse create(PermissionTemplateRequest request);

    PermissionTemplateResponse update(Long id, PermissionTemplateRequest request);

    void delete(Long id);
}
