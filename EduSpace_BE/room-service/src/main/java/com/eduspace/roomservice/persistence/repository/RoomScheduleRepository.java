package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomScheduleEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomScheduleRepository extends JpaRepository<RoomScheduleEntity, Long> {

    List<RoomScheduleEntity> findByRoomIdOrderByDayOfWeekAsc(Integer roomId);

    void deleteByRoomId(Integer roomId);
}
