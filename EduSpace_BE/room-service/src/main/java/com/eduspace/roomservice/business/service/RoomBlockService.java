package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.RoomBlockRequest;
import com.eduspace.roomservice.model.dto.response.RoomBlockResponse;
import java.util.List;

public interface RoomBlockService {

    List<RoomBlockResponse> getAll();

    /** Lịch chặn theo cơ sở (chi nhánh). */
    List<RoomBlockResponse> getByPropertyId(Integer propertyId);

    /** Tương thích: lấy theo phòng → cùng danh sách với cơ sở của phòng đó. */
    List<RoomBlockResponse> getByRoomId(Integer roomId);

    RoomBlockResponse getById(Integer id);

    RoomBlockResponse create(RoomBlockRequest request);

    RoomBlockResponse update(Integer id, RoomBlockRequest request);

    void deleteById(Integer id);
}
