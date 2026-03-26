package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

import com.eduspace.roomservice.common.i18n.TranslationUtil;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {RoomPolicyMapper.class, RoomAmenityMapper.class, RoomCategoryMapper.class, RoomPriceRuleMapper.class},
        imports = {TranslationUtil.class})
public interface RoomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "priceRules", ignore = true)
    @Mapping(target = "pendingEditPayload", ignore = true)
    @Mapping(target = "pendingEditStatus", ignore = true)
    @Mapping(target = "pendingEditRejectionNote", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    RoomEntity toEntity(RoomRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "priceRules", ignore = true)
    @Mapping(target = "pendingEditPayload", ignore = true)
    @Mapping(target = "pendingEditStatus", ignore = true)
    @Mapping(target = "pendingEditRejectionNote", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    void updateEntity(RoomRequest request, @MappingTarget RoomEntity entity);

    @Mapping(target = "propertyId", source = "property.id")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "schedules", ignore = true)
    @Mapping(target = "timeslots", ignore = true)
    @Mapping(target = "scheduleBufferMinutes", ignore = true)
    @Mapping(target = "scheduleIsOverDay", ignore = true)
    @Mapping(target = "name", expression = "java(TranslationUtil.translate(entity.getNameVi(), entity.getNameEn()))")
    @Mapping(target = "description", expression = "java(TranslationUtil.translate(entity.getDescriptionVi(), entity.getDescriptionEn()))")
    @Mapping(target = "location", expression = "java(TranslationUtil.translate(entity.getLocationVi(), entity.getLocationEn()))")
    @Mapping(target = "imagesAlt", expression = "java(TranslationUtil.translate(entity.getImagesAltVi(), entity.getImagesAltEn()))")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "approvedBy", source = "approvedBy")
    @Mapping(target = "approvedAt", source = "approvedAt")
    RoomResponse toResponse(RoomEntity entity);

    List<RoomResponse> toResponseList(List<RoomEntity> entities);
}
