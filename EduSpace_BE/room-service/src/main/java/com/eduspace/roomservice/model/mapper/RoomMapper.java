package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {RoomPolicyMapper.class})
public interface RoomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "pendingEditPayload", ignore = true)
    @Mapping(target = "pendingEditStatus", ignore = true)
    @Mapping(target = "pendingEditRejectionNote", ignore = true)
    RoomEntity toEntity(RoomRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "pendingEditPayload", ignore = true)
    @Mapping(target = "pendingEditStatus", ignore = true)
    @Mapping(target = "pendingEditRejectionNote", ignore = true)
    void updateEntity(RoomRequest request, @MappingTarget RoomEntity entity);

    @Mapping(target = "propertyId", source = "property.id")
    @Mapping(target = "schedules", ignore = true) // Schedules come from a service
    RoomResponse toResponse(RoomEntity entity);

    List<RoomResponse> toResponseList(List<RoomEntity> entities);
}
