package com.eduspace.roomservice.model.mapper;

import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import com.eduspace.roomservice.model.dto.request.RoomRequest;
import com.eduspace.roomservice.model.dto.response.RoomResponse;
import com.eduspace.roomservice.model.entity.RoomEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facility", ignore = true)
    @Mapping(target = "roomType", expression = "java(toRoomTypeString(request.getRoomType()))")
    @Mapping(target = "bookingType", expression = "java(toBookingTypeString(request.getBookingType()))")
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "approvalStatus", expression = "java(toApprovalStatusString(request.getApprovalStatus()))")
    RoomEntity toEntity(RoomRequest request);

    @Mapping(target = "facilityId", expression = "java(entity.getFacility() != null ? entity.getFacility().getId() : null)")
    @Mapping(target = "roomType", expression = "java(toRoomType(entity.getRoomType()))")
    @Mapping(target = "bookingType", expression = "java(toBookingType(entity.getBookingType()))")
    @Mapping(target = "status", expression = "java(toStatus(entity.getStatus()))")
    @Mapping(target = "approvalStatus", expression = "java(toApprovalStatus(entity.getApprovalStatus()))")
    RoomResponse toResponse(RoomEntity entity);

    List<RoomResponse> toResponseList(List<RoomEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "facility", ignore = true)
    @Mapping(target = "roomType", expression = "java(toRoomTypeString(request.getRoomType()))")
    @Mapping(target = "bookingType", expression = "java(toBookingTypeString(request.getBookingType()))")
    @Mapping(target = "status", expression = "java(toStatusString(request.getStatus()))")
    @Mapping(target = "approvalStatus", expression = "java(toApprovalStatusString(request.getApprovalStatus()))")
    void updateEntity(RoomRequest request, @MappingTarget RoomEntity entity);

    default String toRoomTypeString(RoomType e) {
        return e == null ? null : e.name();
    }

    default RoomType toRoomType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return RoomType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }

    default String toBookingTypeString(BookingType e) {
        return e == null ? null : e.name();
    }

    default BookingType toBookingType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return BookingType.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }

    default String toStatusString(RoomStatus e) {
        return e == null ? null : e.name();
    }

    default RoomStatus toStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return RoomStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }

    default String toApprovalStatusString(RoomApprovalStatus e) {
        return e == null ? null : e.name();
    }

    default RoomApprovalStatus toApprovalStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return RoomApprovalStatus.valueOf(s); } catch (IllegalArgumentException ex) { return null; }
    }
}
