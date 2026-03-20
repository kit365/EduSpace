package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.BlockType;
import com.eduspace.roomservice.model.dto.request.SystemCalendarRuleRequest;
import com.eduspace.roomservice.model.dto.response.SystemCalendarRuleResponse;
import com.eduspace.roomservice.model.entity.SystemCalendarRuleEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SystemCalendarRuleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "blockType", expression = "java(toBlockTypeString(request.getBlockType()))")
    SystemCalendarRuleEntity toEntity(SystemCalendarRuleRequest request);

    @Mapping(target = "blockType", expression = "java(toBlockType(entity.getBlockType()))")
    SystemCalendarRuleResponse toResponse(SystemCalendarRuleEntity entity);

    List<SystemCalendarRuleResponse> toResponseList(List<SystemCalendarRuleEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "blockType", expression = "java(toBlockTypeString(request.getBlockType()))")
    void updateEntity(SystemCalendarRuleRequest request, @MappingTarget SystemCalendarRuleEntity entity);

    default String toBlockTypeString(BlockType e) {
        return e == null ? null : e.name();
    }

    default BlockType toBlockType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return BlockType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
