package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.PropertyScheduleReplaceRequest;
import com.eduspace.roomservice.model.dto.request.RoomScheduleItemRequest;
import com.eduspace.roomservice.model.dto.response.PropertyScheduleBundleResponse;
import com.eduspace.roomservice.model.dto.response.RoomScheduleResponse;
import java.util.List;

public interface RoomScheduleService {

    /** Lịch theo phòng: thực tế đọc theo property của phòng. */
    List<RoomScheduleResponse> listByRoomId(Integer roomId);

    /** Lịch giờ mở cửa của cơ sở (chi nhánh). */
    List<RoomScheduleResponse> listByPropertyId(Integer propertyId);

    /** Buffer + cờ over-day + 7 dòng lịch (theo properties). */
    PropertyScheduleBundleResponse getScheduleBundleByPropertyId(Integer propertyId);

    void assertPropertyOwner(Integer propertyId, String ownerId);

    /** Ghi lịch khi host gọi qua PUT /rooms/{roomId}/schedules — áp dụng cho cả cơ sở. */
    void replaceSchedules(Integer roomId, String ownerId, List<RoomScheduleItemRequest> items);

    /** Ghi lịch trực tiếp theo cơ sở (PUT /properties/{id}/schedules). */
    void replaceSchedulesForProperty(Integer propertyId, String ownerId, List<RoomScheduleItemRequest> items);

    /** Ghi buffer + over-day + 7 dòng (PUT /properties/{id}/schedules body mới). */
    void replacePropertyScheduleBundle(Integer propertyId, String ownerId, PropertyScheduleReplaceRequest request);

    /** Tạo lịch mặc định nếu cơ sở chưa có dòng nào (khi tạo phòng mới). */
    void seedDefaultsForNewRoom(Integer roomId);
}
