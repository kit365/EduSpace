package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomPolicyRepository extends JpaRepository<RoomPolicyEntity, Integer> {
    List<RoomPolicyEntity> findByRoomId(Integer roomId);
}
