package com.eduspace.conversationservice.persistence.repository;

import com.eduspace.conversationservice.model.entity.OutboxEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEventEntity, Long> {

    @Query("""
            select e from OutboxEventEntity e
            where e.status = :status
              and e.availableAt <= :now
            order by e.id asc
            """)
    List<OutboxEventEntity> findPublishable(
            @Param("status") OutboxEventEntity.Status status,
            @Param("now") LocalDateTime now,
            org.springframework.data.domain.Pageable pageable
    );
}

