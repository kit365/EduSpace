package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.ReviewStatus;
import com.eduspace.roomservice.model.dto.request.ReviewRequest;
import com.eduspace.roomservice.model.dto.response.ReviewResponse;
import com.eduspace.roomservice.model.entity.ReviewEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    ReviewEntity toEntity(ReviewRequest request);

    @Mapping(target = "roomId", expression = "java(entity.getRoom() != null ? entity.getRoom().getId() : null)")
    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    ReviewResponse toResponse(ReviewEntity entity);

    List<ReviewResponse> toResponseList(List<ReviewEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(ReviewRequest request, @MappingTarget ReviewEntity entity);

    default String toStatusString(ReviewStatus e) {
        return e == null ? null : e.name();
    }

    default ReviewStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return ReviewStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
