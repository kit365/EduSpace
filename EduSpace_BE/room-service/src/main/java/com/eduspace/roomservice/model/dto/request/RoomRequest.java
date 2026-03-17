package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRequest {

    Integer propertyId;
    RoomType roomType;
    BookingType bookingType;
    String name;
    Integer capacity;
    BigDecimal area;
    String location;
    String images;
    String description;
    RoomStatus status;
    RoomApprovalStatus approvalStatus;
    String rejectionNote;
    BigDecimal avgRating;
    Integer reviewCount;
    LocalDateTime deletedAt;
    Boolean isActive;
}
