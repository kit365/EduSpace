package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.TimeSlotEntity;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlotEntity, Long> {
    List<TimeSlotEntity> findByIsActiveTrueOrderByStartTimeAsc();

    List<TimeSlotEntity> findByIdInAndIsActiveTrue(Collection<Long> ids);
}
