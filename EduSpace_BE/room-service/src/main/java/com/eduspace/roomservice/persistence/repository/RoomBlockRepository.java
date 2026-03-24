package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomBlockEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomBlockRepository extends JpaRepository<RoomBlockEntity, Integer> {

    List<RoomBlockEntity> findByProperty_Id(Integer propertyId);
}
