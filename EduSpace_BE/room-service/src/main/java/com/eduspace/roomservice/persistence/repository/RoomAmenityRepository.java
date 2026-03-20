package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomAmenityEntity;
import com.eduspace.roomservice.model.entity.RoomAmenityId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomAmenityRepository extends JpaRepository<RoomAmenityEntity, RoomAmenityId> {

    List<RoomAmenityEntity> findById_RoomId(Integer roomId);

    List<RoomAmenityEntity> findById_AmenityId(Integer amenityId);
}
