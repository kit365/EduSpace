package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.FacilityStatus;
import com.eduspace.roomservice.model.dto.request.FacilityRequest;
import com.eduspace.roomservice.model.dto.response.FacilityResponse;
import com.eduspace.roomservice.model.entity.FacilityEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FacilityMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    FacilityEntity toEntity(FacilityRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    void updateEntity(FacilityRequest request, @MappingTarget FacilityEntity entity);

    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    FacilityResponse toResponse(FacilityEntity entity);

    List<FacilityResponse> toResponseList(List<FacilityEntity> entities);

    default String toStatusString(FacilityStatus e) {
        return e == null ? null : e.name();
    }

    default FacilityStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return FacilityStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
