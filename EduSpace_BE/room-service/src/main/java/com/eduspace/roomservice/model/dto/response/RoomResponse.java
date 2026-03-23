package com.eduspace.roomservice.model.dto.response;

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
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {

    Integer id;
    Integer propertyId;
    RoomType roomType;
    BookingType bookingType;
    String name;
    String location;
    String slug;
    Integer capacity;
    BigDecimal area;
    String roomNumber;
    String floorNumber;
    Boolean is24_7;
    List<RoomScheduleResponse> schedules;
    List<RoomTimeslotResponse> timeslots;
    List<RoomPolicyResponse> policies;
    List<RoomAmenityResponse> amenities;
    BigDecimal pricePerHour;
    BigDecimal pricePerDay;
    Integer minBookingHours;
    String images;
    String imagesAlt;
    String description;
    RoomStatus status;
    RoomApprovalStatus approvalStatus;
    String rejectionNote;
    BigDecimal avgRating;
    Integer reviewCount;
    LocalDateTime deletedAt;
    Boolean isActive;

    /** Thời điểm cập nhật bản ghi (audit UI). */
    LocalDateTime updatedAt;

    /** NULL / NONE / PENDING — chờ duyệt chỉnh sửa. */
    String pendingEditStatus;
    String pendingEditRejectionNote;
    /** JSON RoomRequest — admin xem trước khi duyệt. */
    String pendingEditPayload;

    BigDecimal latitude;
    BigDecimal longitude;
    String approvedBy;
    LocalDateTime approvedAt;

    RoomCategoryResponse category;
}
