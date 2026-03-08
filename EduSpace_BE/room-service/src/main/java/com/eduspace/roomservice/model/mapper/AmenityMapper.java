package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.AmenityType;
import com.eduspace.roomservice.model.dto.request.AmenityRequest;
import com.eduspace.roomservice.model.dto.response.AmenityResponse;
import com.eduspace.roomservice.model.entity.AmenityEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AmenityMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", expression = "java(toTypeString(request.getType()))")
    AmenityEntity toEntity(AmenityRequest request);

    @Mapping(target = "type", expression = "java(toType(entity.getType()))")
    AmenityResponse toResponse(AmenityEntity entity);

    List<AmenityResponse> toResponseList(List<AmenityEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", expression = "java(toTypeString(request.getType()))")
    void updateEntity(AmenityRequest request, @MappingTarget AmenityEntity entity);

    default String toTypeString(AmenityType e) {
        return e == null ? null : e.name();
    }

    default AmenityType toType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return AmenityType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
