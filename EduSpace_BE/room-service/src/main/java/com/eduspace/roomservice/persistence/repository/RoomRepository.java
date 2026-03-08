package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<RoomEntity, String> {
}

