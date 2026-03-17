package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomAdEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomAdRepository extends JpaRepository<RoomAdEntity, Integer> {

    List<RoomAdEntity> findByRoom_Id(Integer roomId);
}
