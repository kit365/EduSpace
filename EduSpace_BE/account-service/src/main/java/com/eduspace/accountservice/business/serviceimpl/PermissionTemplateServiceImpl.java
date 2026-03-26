package com.eduspace.accountservice.business.serviceimpl;

import com.eduspace.accountservice.business.service.PermissionTemplateService;
import com.eduspace.accountservice.exception.AppException;
import com.eduspace.accountservice.exception.ErrorCode;
import com.eduspace.accountservice.model.dto.request.permission.PermissionTemplateRequest;
import com.eduspace.accountservice.model.dto.response.role.PermissionResponse;
import com.eduspace.accountservice.model.dto.response.role.PermissionTemplateResponse;
import com.eduspace.accountservice.model.entity.PermissionEntity;
import com.eduspace.accountservice.model.entity.PermissionTemplateEntity;
import com.eduspace.accountservice.persistence.repository.PermissionRepository;
import com.eduspace.accountservice.persistence.repository.PermissionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionTemplateServiceImpl implements PermissionTemplateService {

    private final PermissionTemplateRepository permissionTemplateRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PermissionTemplateResponse> findAll() {
        List<PermissionTemplateEntity> rows = permissionTemplateRepository.findAllWithPermissions();
        // FETCH JOIN on collections can duplicate the same template in the list; keep one row per id.
        return rows.stream()
                .collect(Collectors.toMap(PermissionTemplateEntity::getId, t -> t, (a, b) -> {
                    a.getPermissions().addAll(b.getPermissions());
                    return a;
                }, LinkedHashMap::new))
                .values()
                .stream()
                .sorted(Comparator.comparing(PermissionTemplateEntity::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionTemplateResponse findById(Long id) {
        PermissionTemplateEntity e = permissionTemplateRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return toResponse(e);
    }

    @Override
    @Transactional
    public PermissionTemplateResponse create(PermissionTemplateRequest request) {
        validateRequest(request);
        String name = request.getName().trim();
        if (permissionTemplateRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        Set<PermissionEntity> perms = resolvePermissions(request.getPermissionIds());
        PermissionTemplateEntity saved = permissionTemplateRepository.save(PermissionTemplateEntity.builder()
                .name(name)
                .description(trimToNull(request.getDescription()))
                .permissions(perms)
                .build());
        return toResponse(permissionTemplateRepository.findByIdWithPermissions(saved.getId()).orElse(saved));
    }

    @Override
    @Transactional
    public PermissionTemplateResponse update(Long id, PermissionTemplateRequest request) {
        validateRequest(request);
        PermissionTemplateEntity e = permissionTemplateRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        String name = request.getName().trim();
        if (permissionTemplateRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        e.setName(name);
        e.setDescription(trimToNull(request.getDescription()));
        e.getPermissions().clear();
        e.getPermissions().addAll(resolvePermissions(request.getPermissionIds()));
        permissionTemplateRepository.save(e);
        return toResponse(permissionTemplateRepository.findByIdWithPermissions(id).orElse(e));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!permissionTemplateRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        permissionTemplateRepository.deleteById(id);
    }

    private void validateRequest(PermissionTemplateRequest request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getPermissionIds() == null || request.getPermissionIds().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private Set<PermissionEntity> resolvePermissions(List<Long> ids) {
        List<PermissionEntity> found = permissionRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        return new HashSet<>(found);
    }

    private static String trimToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private PermissionTemplateResponse toResponse(PermissionTemplateEntity e) {
        return PermissionTemplateResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .permissions(e.getPermissions().stream()
                        .map(p -> PermissionResponse.builder()
                                .id(p.getId())
                                .name(p.getName())
                                .description(p.getDescription())
                                .groupName(p.getGroupName())
                                .build())
                        .collect(Collectors.toSet()))
                .build();
    }
}
