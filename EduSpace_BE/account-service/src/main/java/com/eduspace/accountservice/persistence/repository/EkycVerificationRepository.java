package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.common.enums.VerificationStatus;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EkycVerificationRepository extends JpaRepository<EkycVerificationEntity, String> {
    boolean existsByIdNumberHashAndStatus(String idNumberHash, VerificationStatus status);
    Optional<EkycVerificationEntity> findByUserId(String userId);
    Optional<EkycVerificationEntity> findFirstByUserIdAndStatusOrderByCreatedAtDesc(String userId, VerificationStatus status);
}
