package com.eduspace.bookingservice.infrastructure.client;

import com.eduspace.bookingservice.model.dto.integration.ApiWrapper;
import com.eduspace.bookingservice.model.dto.integration.RoomBlockPayload;
import com.eduspace.bookingservice.model.dto.integration.RoomResponsePayload;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "room-service",
        url = "${integration.room-service.base-url:http://localhost:8083}",
        contextId = "roomServiceClient")
public interface RoomServiceClient {

    @GetMapping("/api/v1/public/rooms/{roomId}")
    ApiWrapper<RoomResponsePayload> getPublicRoom(@PathVariable("roomId") Long roomId);

    @GetMapping("/api/v1/room-blocks")
    ApiWrapper<List<RoomBlockPayload>> listRoomBlocks(@RequestParam("roomId") Integer roomId);
}
