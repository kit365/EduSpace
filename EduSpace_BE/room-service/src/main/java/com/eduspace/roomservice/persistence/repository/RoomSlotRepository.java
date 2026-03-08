package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomSlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomSlotRepository extends JpaRepository<RoomSlotEntity, Integer> {

    List<RoomSlotEntity> findByRoom_Id(Integer roomId);
}
