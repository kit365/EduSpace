package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomScheduleEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomScheduleRepository extends JpaRepository<RoomScheduleEntity, Long> {

    List<RoomScheduleEntity> findByProperty_IdOrderByDayOfWeekAsc(Integer propertyId);

    void deleteByProperty_Id(Integer propertyId);

    boolean existsByProperty_Id(Integer propertyId);
}
