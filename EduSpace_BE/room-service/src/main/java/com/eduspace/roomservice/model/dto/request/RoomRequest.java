package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.BookingType;
import com.eduspace.roomservice.common.enums.RoomApprovalStatus;
import com.eduspace.roomservice.common.enums.RoomStatus;
import com.eduspace.roomservice.common.enums.RoomType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRequest {

    Integer propertyId;
    String categorySlug;
    RoomType roomType;
    BookingType bookingType;
    String nameVi;
    String nameEn;
    String locationVi;
    String locationEn;
    Integer capacity;
    BigDecimal area;
    String roomNumber;
    String floorNumber;
    Boolean is24_7;
    BigDecimal pricePerHour;
    BigDecimal pricePerDay;
    Integer minBookingHours;
    String images;
    String imagesAltVi;
    String imagesAltEn;
    String descriptionVi;
    String descriptionEn;
    RoomStatus status;
    RoomApprovalStatus approvalStatus;
    String rejectionNote;
    BigDecimal avgRating;
    Integer reviewCount;
    LocalDateTime deletedAt;
    Boolean isActive;
    
    BigDecimal latitude;
    BigDecimal longitude;

    List<RoomPolicyRequest> policies;
    List<Integer> amenityIds;
}
