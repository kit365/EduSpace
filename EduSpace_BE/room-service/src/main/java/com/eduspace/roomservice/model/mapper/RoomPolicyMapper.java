package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.RoomPolicyRequest;
import com.eduspace.roomservice.model.dto.response.RoomPolicyResponse;
import com.eduspace.roomservice.model.entity.RoomPolicyEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomPolicyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RoomPolicyEntity toEntity(RoomPolicyRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(RoomPolicyRequest request, @MappingTarget RoomPolicyEntity entity);

    RoomPolicyResponse toResponse(RoomPolicyEntity entity);

    List<RoomPolicyResponse> toResponseList(List<RoomPolicyEntity> entities);
}
