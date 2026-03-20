package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomBlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomBlockRepository extends JpaRepository<RoomBlockEntity, Integer> {

    List<RoomBlockEntity> findByRoom_Id(Integer roomId);
}
