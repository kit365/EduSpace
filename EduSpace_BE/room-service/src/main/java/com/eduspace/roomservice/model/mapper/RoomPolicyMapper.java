package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.request.RoomPolicyRequest;
import com.eduspace.roomservice.model.dto.response.RoomPolicyResponse;
import com.eduspace.roomservice.model.entity.RoomPolicyEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

import com.eduspace.roomservice.common.i18n.TranslationUtil;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {TranslationUtil.class})
public interface RoomPolicyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoomPolicyEntity toEntity(RoomPolicyRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(RoomPolicyRequest request, @MappingTarget RoomPolicyEntity entity);

    @Mapping(target = "name", expression = "java(TranslationUtil.translate(entity.getNameVi(), entity.getNameEn()))")
    @Mapping(target = "description", expression = "java(TranslationUtil.translate(entity.getDescriptionVi(), entity.getDescriptionEn()))")
    @Mapping(target = "logoAlt", expression = "java(TranslationUtil.translate(entity.getLogoAltVi(), entity.getLogoAltEn()))")
    RoomPolicyResponse toResponse(RoomPolicyEntity entity);

    List<RoomPolicyResponse> toResponseList(List<RoomPolicyEntity> entities);
}
