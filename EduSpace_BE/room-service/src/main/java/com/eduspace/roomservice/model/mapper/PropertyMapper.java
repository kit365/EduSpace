package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.PropertyStatus;
import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    PropertyEntity toEntity(PropertyRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    void updateEntity(PropertyRequest request, @MappingTarget PropertyEntity entity);

    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    PropertyResponse toResponse(PropertyEntity entity);

    List<PropertyResponse> toResponseList(List<PropertyEntity> entities);

    default String toStatusString(PropertyStatus e) {
        return e == null ? null : e.name();
    }

    default PropertyStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return PropertyStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
