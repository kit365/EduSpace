package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.RoomAmenityRequest;
import com.eduspace.roomservice.model.dto.response.RoomAmenityResponse;
import com.eduspace.roomservice.model.entity.RoomAmenityEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomAmenityMapper {

    @Mapping(target = "roomId", expression = "java(entity.getId() != null ? entity.getId().getRoomId() : null)")
    @Mapping(target = "amenityId", expression = "java(entity.getId() != null ? entity.getId().getAmenityId() : null)")
    RoomAmenityResponse toResponse(RoomAmenityEntity entity);

    List<RoomAmenityResponse> toResponseList(List<RoomAmenityEntity> entities);
}
