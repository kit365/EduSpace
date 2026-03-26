package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.common.enums.VerificationStatus;
import com.eduspace.accountservice.model.entity.EkycVerificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EkycVerificationRepository extends JpaRepository<EkycVerificationEntity, String> {
    boolean existsByIdCardNumberAndStatus(String idCardNumber, VerificationStatus status);
}
