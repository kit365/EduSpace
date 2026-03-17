package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.RoomAdStatus;
import com.eduspace.roomservice.model.dto.request.RoomAdRequest;
import com.eduspace.roomservice.model.dto.response.RoomAdResponse;
import com.eduspace.roomservice.model.entity.RoomAdEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomAdMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "adsPackage", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    RoomAdEntity toEntity(RoomAdRequest request);

    @Mapping(target = "roomId", expression = "java(entity.getRoom() != null ? entity.getRoom().getId() : null)")
    @Mapping(target = "adsPackageId", expression = "java(entity.getAdsPackage() != null ? entity.getAdsPackage().getId() : null)")
    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    RoomAdResponse toResponse(RoomAdEntity entity);

    List<RoomAdResponse> toResponseList(List<RoomAdEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "adsPackage", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    void updateEntity(RoomAdRequest request, @MappingTarget RoomAdEntity entity);

    default String toStatusString(RoomAdStatus e) {
        return e == null ? null : e.name();
    }

    default RoomAdStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return RoomAdStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
