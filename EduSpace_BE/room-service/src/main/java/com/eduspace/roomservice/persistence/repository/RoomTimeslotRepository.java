package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomTimeslotEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTimeslotRepository extends JpaRepository<RoomTimeslotEntity, Long> {

    List<RoomTimeslotEntity> findByRoomIdAndDayOfWeekAndIsActiveTrueOrderByStartTimeAsc(Integer roomId, Integer dayOfWeek);

    List<RoomTimeslotEntity> findByRoomIdOrderByDayOfWeekAscStartTimeAsc(Integer roomId);

    void deleteByRoomId(Integer roomId);
}
