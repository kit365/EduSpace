package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.ExtraServiceRequest;
import com.eduspace.roomservice.model.dto.response.ExtraServiceResponse;
import com.eduspace.roomservice.model.entity.ExtraServiceEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ExtraServiceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ExtraServiceEntity toEntity(ExtraServiceRequest request);

    @Mapping(target = "propertyId", expression = "java(entity.getProperty() != null ? entity.getProperty().getId() : null)")
    ExtraServiceResponse toResponse(ExtraServiceEntity entity);

    List<ExtraServiceResponse> toResponseList(List<ExtraServiceEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ExtraServiceRequest request, @MappingTarget ExtraServiceEntity entity);
}
