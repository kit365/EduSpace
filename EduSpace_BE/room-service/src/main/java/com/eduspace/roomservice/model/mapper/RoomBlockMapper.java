package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.BlockType;
import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import com.eduspace.roomservice.model.entity.RoomBlockEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomBlockMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "blockType", expression = "java(toBlockTypeString(request.getBlockType()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoomBlockEntity toEntity(RoomBlockRequest request);

    @Mapping(target = "roomId", expression = "java(entity.getRoom() != null ? entity.getRoom().getId() : null)")
    @Mapping(target = "blockType", expression = "java(toBlockType(entity.getBlockType()))")
    RoomBlockResponse toResponse(RoomBlockEntity entity);

    List<RoomBlockResponse> toResponseList(List<RoomBlockEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "blockType", expression = "java(toBlockTypeString(request.getBlockType()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(RoomBlockRequest request, @MappingTarget RoomBlockEntity entity);

    default String toBlockTypeString(BlockType e) {
        return e == null ? null : e.name();
    }

    default BlockType toBlockType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return BlockType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
