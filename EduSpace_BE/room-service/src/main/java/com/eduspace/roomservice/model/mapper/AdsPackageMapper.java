package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.AdsPackageStatus;
import com.eduspace.roomservice.model.dto.request.AdsPackageRequest;
import com.eduspace.roomservice.model.dto.response.AdsPackageResponse;
import com.eduspace.roomservice.model.entity.AdsPackageEntity;
import org.mapstruct.*;

import java.util.List;

import com.eduspace.roomservice.common.i18n.TranslationUtil;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {TranslationUtil.class})
public interface AdsPackageMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AdsPackageEntity toEntity(AdsPackageRequest request);

    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    @Mapping(target = "name", expression = "java(TranslationUtil.translate(entity.getNameVi(), entity.getNameEn()))")
    @Mapping(target = "description", expression = "java(TranslationUtil.translate(entity.getDescriptionVi(), entity.getDescriptionEn()))")
    AdsPackageResponse toResponse(AdsPackageEntity entity);

    List<AdsPackageResponse> toResponseList(List<AdsPackageEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(AdsPackageRequest request, @MappingTarget AdsPackageEntity entity);

    default String toStatusString(AdsPackageStatus e) {
        return e == null ? null : e.name();
    }

    default AdsPackageStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return AdsPackageStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
