package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.AmenityType;
import com.eduspace.roomservice.model.dto.request.AmenityRequest;
import com.eduspace.roomservice.model.dto.response.AmenityResponse;
import com.eduspace.roomservice.model.entity.AmenityEntity;
import org.mapstruct.*;

import java.util.List;

import com.eduspace.roomservice.common.i18n.TranslationUtil;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {TranslationUtil.class})
public interface AmenityMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", expression = "java(toTypeString(request.getType()))")
    @Mapping(target = "price", expression = "java(request.getPrice() != null ? request.getPrice() : 0L)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    AmenityEntity toEntity(AmenityRequest request);

    @Mapping(target = "type", expression = "java(toType(entity.getType()))")
    @Mapping(target = "name", expression = "java(TranslationUtil.translate(entity.getNameVi(), entity.getNameEn()))")
    AmenityResponse toResponse(AmenityEntity entity);

    List<AmenityResponse> toResponseList(List<AmenityEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", expression = "java(toTypeString(request.getType()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(AmenityRequest request, @MappingTarget AmenityEntity entity);

    default String toTypeString(AmenityType e) {
        return e == null ? null : e.name();
    }

    default AmenityType toType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return AmenityType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
