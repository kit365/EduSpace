package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.PointTransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransactionEntity, Long> {
    Page<PointTransactionEntity> findByUserId(String userId, Pageable pageable);
}
