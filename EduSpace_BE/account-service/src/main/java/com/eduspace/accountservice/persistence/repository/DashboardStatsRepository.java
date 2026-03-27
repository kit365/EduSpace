package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.DashboardStatsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardStatsRepository extends JpaRepository<DashboardStatsEntity, Long> {
    
    /** Lấy snapshot mới nhất */
    @Query("SELECT d FROM DashboardStatsEntity d ORDER BY d.createdAt DESC LIMIT 1")
    Optional<DashboardStatsEntity> findLatest();
}
