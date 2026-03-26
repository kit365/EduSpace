package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.model.dto.response.RoomPriceRuleResponse;
import com.eduspace.roomservice.model.entity.RoomPriceRuleEntity;
import java.util.List;
import java.util.Set;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomPriceRuleMapper {

    @Mapping(target = "applicableDayOfWeeks", expression = "java(toSortedDays(entity.getApplicableDayOfWeeks()))")
    RoomPriceRuleResponse toResponse(RoomPriceRuleEntity entity);

    List<RoomPriceRuleResponse> toResponseList(List<RoomPriceRuleEntity> entities);

    default List<Integer> toSortedDays(Set<Integer> days) {
        if (days == null || days.isEmpty()) {
            return List.of();
        }
        return days.stream().sorted().toList();
    }
}
