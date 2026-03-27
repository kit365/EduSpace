package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.response.RoomCategoryResponse;
import com.eduspace.roomservice.model.entity.RoomCategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.eduspace.roomservice.common.i18n.TranslationUtil;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        imports = {TranslationUtil.class})
public interface RoomCategoryMapper {
    @Mapping(target = "name", expression = "java(TranslationUtil.translate(entity.getNameVi(), entity.getNameEn()))")
    @Mapping(target = "description", expression = "java(TranslationUtil.translate(entity.getDescriptionVi(), entity.getDescriptionEn()))")
    @Mapping(target = "imageAlt", expression = "java(TranslationUtil.translate(entity.getImageAltVi(), entity.getImageAltEn()))")
    RoomCategoryResponse toResponse(RoomCategoryEntity entity);
}
