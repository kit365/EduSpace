package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.response.RoomAmenityResponse;
import com.eduspace.roomservice.model.entity.RoomAmenityEntity;
import org.mapstruct.*;

import java.util.List;

import com.eduspace.roomservice.common.i18n.TranslationUtil;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {TranslationUtil.class})
public interface RoomAmenityMapper {

    @Mapping(target = "roomId", expression = "java(entity.getId() != null ? entity.getId().getRoomId() : null)")
    @Mapping(target = "amenityId", expression = "java(entity.getId() != null ? entity.getId().getAmenityId() : null)")
    @Mapping(target = "amenityName", expression = "java(TranslationUtil.translate(entity.getAmenity().getNameVi(), entity.getAmenity().getNameEn()))")
    @Mapping(target = "amenityIcon", source = "amenity.icon")
    RoomAmenityResponse toResponse(RoomAmenityEntity entity);

    List<RoomAmenityResponse> toResponseList(List<RoomAmenityEntity> entities);
}
