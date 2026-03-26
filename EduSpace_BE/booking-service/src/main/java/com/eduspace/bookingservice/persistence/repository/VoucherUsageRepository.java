package com.eduspace.bookingservice.persistence.repository;

import com.eduspace.bookingservice.model.entity.VoucherUsageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsageEntity, Long> {

    List<VoucherUsageEntity> findAllByUserId(String userId);

    List<VoucherUsageEntity> findAllByVoucherId(Long voucherId);

    boolean existsByVoucherIdAndBookingId(Long voucherId, Long bookingId);
}
