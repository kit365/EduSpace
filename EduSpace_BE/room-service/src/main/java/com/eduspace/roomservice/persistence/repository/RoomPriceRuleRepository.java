package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomPriceRuleEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomPriceRuleRepository extends JpaRepository<RoomPriceRuleEntity, Integer> {

    List<RoomPriceRuleEntity> findByRoom_IdOrderByIdAsc(Integer roomId);
}
