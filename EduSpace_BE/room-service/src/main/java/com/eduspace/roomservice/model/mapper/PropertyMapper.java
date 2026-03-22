package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.PropertyRequest;
import com.eduspace.roomservice.model.dto.response.PropertyResponse;
import com.eduspace.roomservice.model.entity.PropertyEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "propertyType", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    PropertyEntity toEntity(PropertyRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "propertyType", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateEntity(PropertyRequest request, @MappingTarget PropertyEntity entity);

    PropertyResponse toResponse(PropertyEntity entity);

    List<PropertyResponse> toResponseList(List<PropertyEntity> entities);
}
