package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.RoomSlotStatus;
import com.eduspace.roomservice.model.dto.request.RoomSlotRequest;
import com.eduspace.roomservice.model.dto.response.RoomSlotResponse;
import com.eduspace.roomservice.model.entity.RoomSlotEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomSlotMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    RoomSlotEntity toEntity(RoomSlotRequest request);

    @Mapping(target = "roomId", expression = "java(entity.getRoom() != null ? entity.getRoom().getId() : null)")
    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    RoomSlotResponse toResponse(RoomSlotEntity entity);

    List<RoomSlotResponse> toResponseList(List<RoomSlotEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    void updateEntity(RoomSlotRequest request, @MappingTarget RoomSlotEntity entity);

    default String toStatusString(RoomSlotStatus e) {
        return e == null ? null : e.name();
    }

    default RoomSlotStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return RoomSlotStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
