package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.AdsPackageStatus;
import com.eduspace.roomservice.model.dto.request.AdsPackageRequest;
import com.eduspace.roomservice.model.dto.response.AdsPackageResponse;
import com.eduspace.roomservice.model.entity.AdsPackageEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AdsPackageMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    AdsPackageEntity toEntity(AdsPackageRequest request);

    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    AdsPackageResponse toResponse(AdsPackageEntity entity);

    List<AdsPackageResponse> toResponseList(List<AdsPackageEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    void updateEntity(AdsPackageRequest request, @MappingTarget AdsPackageEntity entity);

    default String toStatusString(AdsPackageStatus e) {
        return e == null ? null : e.name();
    }

    default AdsPackageStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return AdsPackageStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
